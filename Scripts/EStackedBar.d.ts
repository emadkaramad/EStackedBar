interface IEsbDataManager {
    items: IEsbItem[];
    columns: IEsbColumn[];
    convertToDate: (dateStr: string) => Date;
    getItemsByDate: (dateFrom: Date, dateTo: Date) => IEsbItem[];
    getItemsBySectionId: (sectionId: string) => IEsbItem[];
    getItemsBySectionIdAndDate: (sectionId: string, dateFrom: Date, dateTo: Date) => IEsbItem[];
    getItemById: (id: string) => IEsbItem;
    getColumnById: (id: string) => IEsbColumn;
    getSectionById: (id: string) => IEsbSection;
    getColumnByIndex: (index: number) => IEsbColumn;
    getSectionByIndex: (columnIndex: number, index: number) => IEsbSection;
    getTotalColumns: () => number;
    getTotalItems: () => number;
    getTotalItemsValue: (sectionId: string) => number;
    getTotalColumnCapacity: (columnId) => number;
    updateItem: (item: any) => void;
}

interface IEsbItem {
    id: string,
    class: string,
    content: string,
    value: number,
    date: string,
    section: string,
    resizable: boolean,
    draggable: boolean,
}

interface IEsbColumn {
    id: string;
    class: string;
    header: string;
    sections: IEsbSection[];
}

interface IEsbSection {
    id: string;
    header: string;
    dateFrom: Date;
    dateTo: Date;
    capacity: number;
    grids: number;
    grid_lines: number;
    class: string;
    overflow: boolean;
    droppable: boolean;
}

interface IEsbStackedBarCore {
    baseElement: JQuery;
    dataManager: IEsbDataManager;
    onItemMoved: (data: IEsbItemMovedEventData, ui: IEsbItemMovedEventUI) => boolean;
    onItemResizing: (data: IEsbItemResizingEventData, ui: IEsbItemResizingEventUI) => boolean;
    onItemResized: (data: IEsbItemResizingEventData, ui: IEsbItemResizedEventUI) => boolean;
    onOverflow: (data: IEsbOverflowEventData, ui: IEsbOverflowEventUI) => boolean;
}

interface IEsbEventData {
    dataManager: IEsbDataManager;
}

interface IEsbItemMovedEventData extends IEsbEventData {

}

interface IEsbItemResizingEventData extends IEsbEventData {

}

interface IEsbItemResizedEventData extends IEsbEventData {

}

interface IEsbOverflowEventData extends IEsbEventData {

}

interface IEsbEventUI {
    baseElement: JQuery;
}

interface IEsbItemMovedEventUI extends IEsbEventUI {

}

interface IEsbItemResizingEventUI extends IEsbEventUI {

}

interface IEsbItemResizedEventUI extends IEsbEventUI {

}

interface IEsbOverflowEventUI extends IEsbEventUI {

}
