// 按列拆表：把宽表拆成多个窄表（每个子表保留所有行）
export function splitTableByColumns(table: HTMLTableElement, maxColsPerTable = 6) {
    const theadTr = table.querySelector('thead tr');
    const tbodyRows = Array.from(table.querySelectorAll('tbody tr'));
    if (!theadTr || tbodyRows.length === 0) return null;

    const ths = Array.from(theadTr.querySelectorAll('th'));
    const bodyCells = tbodyRows.map(tr => Array.from(tr.querySelectorAll('td')));
    const totalCols = ths.length;
    if (totalCols === 0) return null;

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '16px';

    for (let start = 0; start < totalCols; start += maxColsPerTable) {
        const end = Math.min(start + maxColsPerTable, totalCols);

        const newTable = document.createElement('table');
        newTable.style.width = '100%';
        newTable.style.borderCollapse = 'collapse';

        const newThead = document.createElement('thead');
        const newHeadTr = document.createElement('tr');
        ths.slice(start, end).forEach(th => newHeadTr.appendChild(th.cloneNode(true)));
        newThead.appendChild(newHeadTr);
        newTable.appendChild(newThead);

        const newTbody = document.createElement('tbody');
        tbodyRows.forEach((_, rowIndex) => {
            const tr = document.createElement('tr');
            bodyCells[rowIndex].slice(start, end).forEach(td => tr.appendChild(td.cloneNode(true)));
            newTbody.appendChild(tr);
        });
        newTable.appendChild(newTbody);

        wrapper.appendChild(newTable);
    }

    return wrapper;
}
// 导出前预处理所有表格：根据「宽度 / 目标宽度」决定“拆表”还是“去掉 overflow”
export function prepareTablesForExport(rootEl: HTMLElement) {
    const wrappers = Array.from(rootEl.querySelectorAll<HTMLElement>('.overflow-x-auto'));
    const targetWidth = rootEl.clientWidth || rootEl.offsetWidth || 800; // 近似 A4 可显示宽度
    const threshold = 1.5; // 你说的 1.5 倍

    wrappers.forEach(wrapper => {
        const table = wrapper.querySelector('table');
        if (!table) return;

        const tableWidth = table.scrollWidth || table.offsetWidth;
        const ratio = tableWidth / targetWidth;

        if (ratio <= threshold) {
            wrapper.style.overflowX = 'visible';
            wrapper.style.overflow = 'visible';
        } else {
            // 超宽表：按列拆成多个子表
            const split = splitTableByColumns(table, 6); // 这里先写死每表 6 列，你可以再调
            if (!split) return;
            wrapper.replaceChild(split, table);
        }
    });
}
