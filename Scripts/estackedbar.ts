/// <reference path="import/jquery.d.ts"/>
/// <reference path="import/jqueryui.d.ts"/>

namespace EControls {
    export namespace EStackedBarControl {
        class DataManager {
            items: any;
            columns: any;

            constructor(items: any, columns: any) {
                this.items = items;
                this.columns = columns;
            }

            convertToDate = (dateStr: string) => {
                return new Date(dateStr);
            }

            getItemsByDate = (dateFrom: Date, dateTo: Date) => {
                var result = [];
                this.items.forEach(item => {
                    if (item.hasOwnProperty("date")) {
                        let date = this.convertToDate(item["date"]);
                        if (date >= dateFrom && date <= dateTo)
                            result.push(item);
                    }
                });

                return result;
            }

            getItemsBySectionId = (sectionId: string) => {
                var result = [];
                this.items.forEach(item => {
                    if (item.hasOwnProperty("section") && item["section"] == sectionId) {
                        result.push(item);
                    }
                });

                return result;
            }

            getItemsBySectionIdAndDate = (sectionId: string, dateFrom: Date, dateTo: Date) => {
                var result = [];
                this.items.forEach(item => {
                    if (item.hasOwnProperty("section") && item["section"] == sectionId) {
                        result.push(item);
                        return;
                    }
                    if (item.hasOwnProperty("date")) {
                        let date = this.convertToDate(item["date"]);
                        if (date >= dateFrom && date <= dateTo)
                            result.push(item);
                    }
                });

                return result;
            }

            getItemById = (id: string) => {
                for (var i = 0; i < this.items.length; i++) {
                    let item = this.items[i];
                    if (item["id"] == id)
                        return item;
                }
                return null;
            }

            getColumnById = (id: string) => {
                for (var i = 0; i < this.columns.length; i++) {
                    let column = this.columns[i];
                    if (column["id"] == id)
                        return column;
                }
                return null;
            }

            getSectionById = (id: string) => {
                for (var i = 0; i < this.columns.length; i++) {
                    for (var j = 0; j < this.columns[i].sections.length; j++) {
                        let section = this.columns[i].sections[j];
                        if (section["id"] == id)
                            return section;
                    }
                }
                return null;
            }

            getColumnByIndex = (index: number) => {
                return this.columns[index];
            }

            getSectionByIndex = (columnIndex: number, index: number) => {
                return this.columns[columnIndex].sections[index];
            }

            getTotalColumns = () => {
                return this.columns.length;
            }

            getTotalItems = () => {
                return this.items.length;
            }

            getTotalItemsValue = (sectionId: string) => {
                var result = 0;
                this.getItemsBySectionId(sectionId).forEach(item => {
                    result += item["value"];
                });
                return result;
            }

            getTotalColumnCapacity = (columnId) => {
                var result = 0;
                this.getColumnById(columnId).sections.forEach(section => {
                    result += section["capacity"];
                });
                return result;
            }

            updateItem = (item: any) => {
                for (var i = 0; i < this.items.length; i++) {
                    if (this.items[i]["id"] == item["id"]) {
                        this.items[i] = item;
                        return;
                    }
                }
                this.items.push(item);
            }
        }

        export class EStackedBarCore {
            baseElement: JQuery;
            dataManager: DataManager;
            private sectionHeight: number = 0;
            private availableSectionHeight: number = 0;

            constructor(baseElement: JQuery, options: any) {
                this.baseElement = baseElement;
                if (options.hasOwnProperty("dataSource") != null)
                    this.setDataSource(options.dataSource);

                this.baseElement.addClass("estackedbar");
                this.render();
            }

            private getMainFrame = () => {
                return $(".esb-main-frame", this.baseElement);
            }

            private setDataSource = (dataSource: any) => {
                this.dataManager = new DataManager(dataSource["items"], dataSource["columns"]);
            }

            private findColumnElementByItemElement = (itemElement: JQuery) => {
                let column = itemElement;
                for (var i = 0; i < 4; i++) {
                    column = column.parent();
                    if (column.hasClass("esb-column"))
                        break;
                }
                return column;
            }

            private findSectionElementByItemElement = (itemElement: JQuery) => {
                let section = itemElement;
                for (var i = 0; i < 4; i++) {
                    section = section.parent();
                    if (section.hasClass("esb-section"))
                        break;
                }
                return section;
            }

            private findColumnElementById = (id: string) => {
                return $(".esb-column[data-id=" + id + "]", this.getMainFrame());
            }

            private findSectionElementById = (id: string) => {
                return $(".esb-section[data-id=" + id + "]", this.getMainFrame());
            }

            render = () => {
                this.baseElement.empty();
                var mainFrame = $("<div>").addClass("esb-main-frame");
                this.baseElement.append(mainFrame);
                // Columns
                for (var i = 0; i < this.dataManager.getTotalColumns(); i++) {
                    let column = this.dataManager.getColumnByIndex(i);
                    this.addColumn(column);

                    // Sections
                    for (var j = 0; j < column.sections.length; j++) {
                        let section = this.dataManager.getSectionByIndex(i, j);
                        this.addSectionToColumn(column, section);

                        // Items
                        let items;
                        if (section.hasOwnProperty("date_from") && section.hasOwnProperty("date_to"))
                            items = this.dataManager.getItemsBySectionIdAndDate(section["id"], section["date_from"], section["date_to"]);
                        else
                            items = this.dataManager.getItemsBySectionId(section["id"]);
                        for (var k = 0; k < items.length; k++) {
                            this.addItemToSection(section, items[k]);
                        }
                    }

                    this.recalculateSectionHeights(column["id"]);
                }

                this.baseElement.append(mainFrame);
            }

            addColumn = (column: JSON) => {
                let columnElement = $("<div>").attr("data-id", column["id"]).addClass("esb-column");
                let columnWrapperElement = $("<div>").addClass("esb-column-wrapper");
                if (column.hasOwnProperty("header")) {
                    let headerElement = $("<div>").addClass("esb-column-header");
                    let headerCellElement = $("<div>").addClass("esb-column-header-content");
                    headerCellElement.html(column["header"]);
                    headerElement.append(headerCellElement);
                    columnWrapperElement.append(headerElement);
                }
                let containerWrapperElement = $("<div>").addClass("esb-column-container");
                columnWrapperElement.append(containerWrapperElement);
                columnElement.append(columnWrapperElement);
                this.getMainFrame().append(columnElement);
            }

            addSectionToColumn = (column: JSON, section: JSON) => {
                let columnContainerElement = $(".esb-column-container", this.findColumnElementById(column["id"]));
                let columnCapacity = this.dataManager.getTotalColumnCapacity(column["id"]);
                let sectionHeight = section["capacity"] / columnCapacity * 100;
                if (section["capacity"] == columnCapacity && columnCapacity == 0)
                    sectionHeight = 100;

                let sectionElement = $("<div>").attr("data-id", section["id"]).addClass("esb-section")
                    .css("height", sectionHeight + "%");
                if (section.hasOwnProperty("class"))
                    sectionElement.addClass(section["class"]);
                let contentWrapperElement = $("<div>").addClass("esb-section-content-wrapper");
                let contentElement = $("<div>").addClass("esb-section-content");

                // Grids
                if (section.hasOwnProperty("grid_lines") && section["grid_lines"] > 0) {
                    let gridLineSize = 100 / section["grid_lines"];
                    contentElement[0].appendChild(this.generateGrids(gridLineSize, section["id"]))
                }

                // Gap
                let itemGapElement = $("<div>").addClass("esb-item-gap");
                contentElement.append(itemGapElement);

                contentWrapperElement.append(contentElement);
                if (section.hasOwnProperty("header")) {
                    let headerElement = $("<div>").addClass("esb-section-header");
                    let headerCellElement = $("<div>").addClass("esb-section-header-content");
                    headerCellElement.html(section["header"]);
                    headerElement.append(headerCellElement);
                    sectionElement.append(headerElement);
                }
                sectionElement.append(contentWrapperElement);
                columnContainerElement.append(sectionElement);

                if (section.hasOwnProperty("droppable") && section["droppable"] == true) {
                    contentElement.addClass("esb-content-droppable");
                    contentElement.droppable({
                        tolerance: "intersect",
                        accept: ".esb-item-draggable",
                        addClasses: false,
                        drop: (event, ui) => { this.onDropped(event, ui); },
                    });
                }
            }

            recalculateSectionHeights = (columnId: string) => {
                var column = this.dataManager.getColumnById(columnId);
                let columnCapacity = this.dataManager.getTotalColumnCapacity(column["id"]);
                var totalHeight = 0;
                for (var i = 0; i < column.sections.length; i++) {
                    let section = column.sections[i];
                    let sectionElement = this.findSectionElementById(section["id"]);
                    let sectionHeight = 0;
                    if (i == column.sections.length - 1) {
                        sectionHeight = 100 - totalHeight;
                    }
                    else
                        sectionHeight = Math.ceil(section["capacity"] / columnCapacity * 100);
                    sectionElement.css("height", sectionHeight + "%");
                    totalHeight += sectionHeight;
                }
            }

            addItemToSection = (section: JSON, item: JSON) => {
                let sectionElement = this.findSectionElementById(section["id"]);
                let contentElement = $(".esb-section-content", sectionElement);

                let sectionCapacity = section["capacity"];
                let itemHeight = item["value"] / sectionCapacity * 100;
                let itemWrapperElement = $("<div>").attr("data-id", item["id"]).addClass("esb-item").addClass(item["class"])
                    .css("height", itemHeight + "%");
                let itemContentElement = $("<div>").addClass("esb-item-content").html(item["content"]);

                itemWrapperElement.append(itemContentElement);
                contentElement.append(itemWrapperElement);

                if (item.hasOwnProperty("draggable") && item["draggable"] == true) {
                    itemWrapperElement.addClass("esb-item-draggable");
                    $(itemWrapperElement).draggable({
                        // containment: ".esb-main-frame",
                        helper: "clone",
                        revert: "invalid",
                        start: (event, ui) => { this.onDragStart(event, ui); },
                        stop: (event, ui) => { this.onDragStop(event, ui); }
                    });
                }

                if (item.hasOwnProperty("resizable") && item["resizable"] == true) {
                    itemWrapperElement.addClass("esb-item-resizable");
                    $(itemWrapperElement).resizable({
                        handles: "n",
                        start: (event, ui) => { this.onResizeStart(event, ui); },
                        resize: (event, ui) => { this.onResizing(event, ui); },
                        stop: (event, ui) => { this.onResizeStop(event, ui); }
                    });
                }
            }

            private generateGrids = (heightPercentage: number, id: string): SVGSVGElement => {
                var patternId = "pattern-" + id;
                var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svgElement.setAttribute("class", "esb-section-grid-lines");
                svgElement.setAttribute("width", "100%");
                svgElement.setAttribute("height", "100%");
                svgElement.setAttribute("preserveAspectRatio", "none");
                var patternElement = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
                patternElement.setAttribute("id", patternId);
                patternElement.setAttribute("patternUnits", "userSpaceOnUse");
                patternElement.setAttribute("width", "100%");
                patternElement.setAttribute("height", heightPercentage + "%");
                var lineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
                lineElement.setAttribute("x1", "0");
                lineElement.setAttribute("y1", "1");
                lineElement.setAttribute("x2", "100%");
                lineElement.setAttribute("y2", "1");
                patternElement.appendChild(lineElement);
                var rectElement = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rectElement.setAttribute("x", "0")
                rectElement.setAttribute("y", heightPercentage + "%")
                rectElement.setAttribute("width", "100%")
                rectElement.setAttribute("height", "100%")
                rectElement.setAttribute("fill", "url(#" + patternId + ")");
                svgElement.appendChild(patternElement);
                svgElement.appendChild(rectElement);
                return svgElement;
            }

            private onDragStart = (event, ui) => {
                var element = $(event.target);
                element.addClass("esb-item-drag-shadow");
                $(ui.helper).width(element.width()).height(element.height());
            }

            private onDragStop = (event, ui) => {
                var element = $(event.target);
                element.removeClass("esb-item-dragging-shadow");
            }

            private onDropped = (event, ui) => {
                let sectionElement = this.findSectionElementByItemElement($(event.target));
                let sectionId = sectionElement.attr("data-id");
                let itemElement = $(ui.draggable);
                let itemId = itemElement.attr("data-id");
                let section = this.dataManager.getSectionById(sectionId);
                let item = this.dataManager.getItemById(itemId);

                // Check overflow
                let isOverflowAllowed = section.hasOwnProperty("overflow") && section["overflow"] == true;
                let totalItemValues = this.dataManager.getTotalItemsValue(sectionId);
                if (!isOverflowAllowed && totalItemValues + item["value"] > section["capacity"])
                    return false;

                // Update data source
                item["section"] = sectionId;
                this.dataManager.updateItem(item);

                // Update ui
                let itemHeight = item["value"] / section["capacity"] * 100;
                itemElement.css("height", itemHeight + "%");
                $(".esb-item-gap", event.target).after(itemElement);
            }

            private onResizeStart = (event, ui) => {
                let itemElement = $(ui.element)
                let sectionElement = this.findSectionElementByItemElement(itemElement);
                let sectionContentElement = $(".esb-section-content", sectionElement);

                let totalItemsHeight = 0;
                $(".esb-item", sectionContentElement).each((index, siblingItemElement) => {
                    if ($(siblingItemElement).attr("data-id") != itemElement.attr("data-id"))
                        totalItemsHeight += $(itemElement).height();
                });
                this.sectionHeight = sectionContentElement.height();
                this.availableSectionHeight = this.sectionHeight - totalItemsHeight;
            }

            private onResizing = (event, ui) => {
                let itemElement = $(ui.element);
                itemElement.css("top", "");
                let sectionElement = this.findSectionElementByItemElement(itemElement);
                let section = this.dataManager.getSectionById(sectionElement.attr("data-id"));
                let itemValue = itemElement.height() / this.sectionHeight * section["capacity"];
                // Snap to grid
                let gridSize = section["capacity"] / section["grids"];
                itemValue = Math.floor(itemValue / gridSize) * gridSize;

                let totalItemsValue = itemValue;
                $(".esb-item", sectionElement).each((index, obj) => {
                    let siblingItemId = $(obj).attr("data-id");
                    if (itemElement.attr("data-id") != siblingItemId) {
                        let siblingItem = this.dataManager.getItemById(siblingItemId);
                        totalItemsValue += siblingItem["value"];
                    }
                });

                if (totalItemsValue > section["capacity"] || itemElement.height() > this.availableSectionHeight) {
                    itemValue = section["capacity"] - (totalItemsValue - itemValue);
                }

                let itemHeight = itemValue / section["capacity"] * 100;
                itemElement.css("height", itemHeight + "%");
            }

            private onResizeStop = (event, ui) => {
                let itemElement = $(ui.element)
                let sectionElement = this.findSectionElementByItemElement(itemElement);
                let section = this.dataManager.getSectionById(sectionElement.attr("data-id"));
                let itemId = itemElement.attr("data-id");
                let item = this.dataManager.getItemById(itemId);
                item["value"] = itemElement.height() / this.sectionHeight * section["capacity"];
                this.dataManager.updateItem(item);
            }
        }
    }
}

var EStackedBar = EControls.EStackedBarControl.EStackedBarCore;
