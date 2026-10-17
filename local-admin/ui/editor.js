const el = (id)=>document.getElementById(id);
let payload, pageRoute = new URL(location.href).searchParams.get('page') || '/', fieldPage = 0, current, initial = '', busy = false;
const size = 20;
document.title='Adelaide 防水与贴砖 · 本地内容后台';
document.querySelector('.brand span').textContent='Adelaide 防水与贴砖 · 内容后台';
function message(text, error = false) {
    el('status').textContent = text;
    el('status').dataset.tone = error ? 'error' : 'info';
}
async function api(path, data) {
    const r = await fetch('/admin/api/' + path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': payload.token
        },
        body: JSON.stringify({
            ...data,
            version: payload.state.version
        })
    });
    const result = await r.json();
    if (!r.ok) throw Error(result.error || '操作失败');
    return result;
}
const text = (tag, value, cls = '')=>{
    const node = document.createElement(tag);
    node.textContent = value;
    if (cls) node.className = cls;
    return node;
};
function renderPages() {
    const query = el('page-search').value.trim().toLowerCase();
    const nav = el('pages');
    nav.replaceChildren();
    for (const page of payload.catalog.pages.filter((p)=>(p.title + ' ' + p.route + ' ' + p.category).toLowerCase().includes(query))){
        const button = text('button', page.title);
        button.type = 'button';
        button.append(text('small', page.category + ' · ' + page.route));
        if (page.route === pageRoute) button.setAttribute('aria-current', 'page');
        button.addEventListener('click', ()=>{
            pageRoute = page.route;
            fieldPage = 0;
            history.replaceState(null, '', '?page=' + encodeURIComponent(pageRoute));
            render();
        });
        nav.append(button);
    }
    if (!nav.children.length) nav.append(text('p', '没有匹配的页面', 'muted'));
}
function render() {
    renderPages();
    const page = payload.catalog.pages.find((p)=>p.route === pageRoute) || payload.catalog.pages[0];
    pageRoute = page.route;
    el('page-title').textContent = page.title;
    el('category').textContent = page.category;
    el('page-route').textContent = page.route === 'shared' ? '影响全站的导航、页眉和页脚' : page.route;
    const route = page.route === 'shared' ? '/' : page.route;
    el('preview-zh').href = '/preview/zh' + route;
    el('preview-en').href = '/preview' + route;
    el('pending-count').textContent = payload.pending.length ? `${payload.pending.length} 处中文修改等待英文同步` : '中英文已同步，可以生成上传包';
    el('package').disabled = busy || payload.pending.length > 0;
    const q = el('field-search').value.trim().toLowerCase();
    const only = el('pending-only').checked;
    const fields = page.fieldIds.map((id)=>payload.catalog.fields[id]).filter((f)=>(!only || payload.pending.includes(f.id)) && (f.zh + ' ' + (payload.state.edits[f.id]?.zh || '') + ' ' + f.label + ' ' + f.section).toLowerCase().includes(q));
    const count = Math.max(1, Math.ceil(fields.length / size));
    fieldPage = Math.min(fieldPage, count - 1);
    const start = fieldPage * size;
    el('range').textContent = `共 ${fields.length} 项 · 当前 ${fields.length ? start + 1 : 0}–${Math.min(start + size, fields.length)} 项`;
    const list = el('fields');
    list.replaceChildren();
    for (const field of fields.slice(start, start + size)){
        const row = text('article', '', 'field'), label = text('div', '', 'field-label');
        label.append(text('strong', field.label), text('span', field.section.slice(0, 70)));
        const edit = payload.state.edits[field.id];
        if (edit) label.append(text('span', edit.zhRevision === edit.enRevision ? '已同步' : '英文待同步', 'badge ' + (edit.zhRevision === edit.enRevision ? 'synced' : '')));
        const button = text('button', '编辑');
        button.type = 'button';
        button.addEventListener('click', ()=>openEditor(field));
        row.append(label, text('p', edit?.zh ?? field.zh, 'field-text'), button);
        list.append(row);
    }
    if (!fields.length) list.append(text('p', '没有符合条件的内容。请清空搜索或关闭“只看待同步”。', 'empty'));
    el('page-number').textContent = `${fieldPage + 1} / ${count}`;
    el('previous').disabled = fieldPage === 0;
    el('next').disabled = fieldPage >= count - 1;
}
function openEditor(field) {
    current = field;
    const edit = payload.state.edits[field.id];
    initial = edit?.zh ?? field.zh;
    el('edit-zh').value = initial;
    el('edit-title').textContent = field.label;
    el('edit-section').textContent = field.section;
    el('edit-en').textContent = edit?.en ?? field.en;
    el('edit-original').textContent = field.zh;
    el('edit-error').textContent = '';
    el('edit-zh').removeAttribute('aria-invalid');
    el('shared-note').hidden = !field.shared;
    el('shared-note').textContent = `全站公共内容：此次修改会出现在 ${field.occurrences.length} 个页面。`;
    el('upload-wrap').hidden = field.kind !== 'image';
    el('upload').value = '';
    el('image-preview').src = field.kind === 'image' ? '/preview' + initial : '';
    el('edit-dialog').showModal();
    el('edit-zh').focus();
}
function closeDialog(dialog) {
    if (dialog.id === 'edit-dialog' && el('edit-zh').value !== initial) {
        el('confirm-dialog').showModal();
        return;
    }
    dialog.close();
}
document.querySelectorAll('[data-close]').forEach((b)=>b.addEventListener('click', ()=>closeDialog(b.closest('dialog'))));
el('edit-dialog').addEventListener('cancel', (event)=>{
    event.preventDefault();
    closeDialog(el('edit-dialog'));
});
el('keep-editing').addEventListener('click', ()=>el('confirm-dialog').close());
el('discard').addEventListener('click', ()=>{
    el('confirm-dialog').close();
    el('edit-dialog').close();
});
el('edit-form').addEventListener('submit', async (event)=>{
    event.preventDefault();
    if (!current || busy) return;
    const zh = el('edit-zh').value;
    if (!zh.trim()) {
        el('edit-error').textContent = '请填写内容后保存。';
        el('edit-zh').setAttribute('aria-invalid','true');
        el('edit-zh').focus();
        return;
    }
    busy = true;
    el('save').disabled = true;
    try {
        const result = await api('save', {
            id: current.id,
            zh
        });
        payload.state = result.state;
        payload.pending = result.pending;
        initial = zh;
        el('edit-dialog').close();
        message('中文草稿已保存到本地，线上网站未变化。');
        render();
    } catch (e) {
        el('edit-error').textContent = e instanceof Error ? e.message : '保存失败';
        el('edit-zh').setAttribute('aria-invalid','true');
        el('edit-zh').focus();
    } finally{
        busy = false;
        el('save').disabled = false;
        render();
    }
});
el('upload').addEventListener('change', async ()=>{
    const file = el('upload').files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
        el('edit-error').textContent = '图片不能超过 10 MB。';
        return;
    }
    try {
        const base64 = await new Promise((resolve, reject)=>{
            const reader = new FileReader();
            reader.onload = ()=>resolve(String(reader.result).split(',')[1]);
            reader.onerror = ()=>reject(Error('无法读取图片'));
            reader.readAsDataURL(file);
        });
        const result = await api('upload', {
            base64
        });
        el('edit-zh').value = result.path;
        el('image-preview').src = '/preview' + result.path;
        el('edit-error').textContent = '图片已导入，请点击保存中文草稿。';
    } catch (e) {
        el('edit-error').textContent = e instanceof Error ? e.message : '上传失败';
    }
});
let loading;
async function load() {
    loading?.abort();
    const controller = new AbortController();
    loading = controller;
    try {
        const r = await fetch('/admin/api/state', {
            signal: controller.signal
        });
        if (!r.ok) throw Error('无法读取后台');
        const next = await r.json();
        if (controller.signal.aborted) return;
        payload = next;
        document.querySelectorAll('button[data-initialize]').forEach((b)=>{
            b.disabled = false;
            b.removeAttribute('data-initialize');
        });
        render();
        message('所有修改保存在本机。保存草稿不会发布上线。');
    } catch (e) {
        if (!controller.signal.aborted) message(e instanceof Error ? e.message : '读取失败', true);
    }
}
for (const id of [
    'page-search',
    'field-search'
]){
    const input = el(id);
    const update = ()=>{
        if (id === 'field-search') fieldPage = 0;
        render();
    };
    input.addEventListener('input', (event)=>{
        if (!event.isComposing && payload) update();
    });
    input.addEventListener('compositionend', ()=>{
        if (payload) update();
    });
}
el('clear-pages').addEventListener('click', ()=>{
    el('page-search').value = '';
    render();
    el('page-search').focus();
});
el('clear-fields').addEventListener('click', ()=>{
    el('field-search').value = '';
    fieldPage = 0;
    render();
    el('field-search').focus();
});
el('pending-only').addEventListener('change', ()=>{
    fieldPage = 0;
    render();
});
el('previous').addEventListener('click', ()=>{
    fieldPage--;
    render();
});
el('next').addEventListener('click', ()=>{
    fieldPage++;
    render();
});
el('refresh').addEventListener('click', ()=>void load());
el('history-button').addEventListener('click', ()=>{
    const list = el('history');
    list.replaceChildren();
    for (const revision of [
        {version:0,time:null,action:'初始内容（尚未修改）'},...payload.state.history
    ].reverse()){
        const row = text('div', '', 'history-row');
        row.append(text('p', `版本 ${revision.version}${revision.time?' · '+new Date(revision.time).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'})+'（北京时间）':''}\n${revision.action}`));
        const button = text('button', '恢复此版本');
        button.disabled = revision.version === payload.state.version;
        button.addEventListener('click', async ()=>{
            button.disabled = true;
            try {
                const r = await api('restore', {
                    revision: revision.version
                });
                payload.state = r.state;
                payload.pending = r.pending;
                el('history-dialog').close();
                render();
                message('已恢复，恢复前的内容仍保存在历史记录中。');
            } catch (e) {
                message(e instanceof Error ? e.message : '恢复失败', true);
                button.disabled = false;
            }
        });
        row.append(button);
        list.append(row);
    }
    if (!list.children.length) list.append(text('p', '还没有保存记录。'));
    el('history-dialog').showModal();
});
el('package').addEventListener('click', async ()=>{
    if (busy) return;
    busy = true;
    render();
    message('正在检查并生成上传包…');
    try {
        const result = await api('package', {});
        message('上传包已生成：' + result.directory);
    } catch (e) {
        message(e instanceof Error ? e.message : '打包失败', true);
    } finally{
        busy = false;
        render();
    }
});
window.addEventListener('beforeunload', (event)=>{
    if (el('edit-dialog').open && el('edit-zh').value !== initial) {
        event.preventDefault();
    }
});
void load();
