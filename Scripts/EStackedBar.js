/// <reference path="import/jquery.d.ts"/>
/// <reference path="import/jqueryui.d.ts"/>
/// <reference path="EStackedBar.d.ts"/>
var EControls;
(function (EControls) {
    var EStackedBarControl;
    (function (EStackedBarControl) {
        var DataManager = (function () {
            function DataManager(items, columns) {
                var _this = this;
                this.convertToDate = function (dateStr) {
                    return new Date(dateStr);
                };
                this.getItemsByDate = function (dateFrom, dateTo) {
                    var result = [];
                    _this.items.forEach(function (item) {
                        if (item.date) {
                            var date = _this.convertToDate(item.date);
                            if (date >= dateFrom && date <= dateTo)
                                result.push(item);
                        }
                    });
                    return result;
                };
                this.getItemsBySectionId = function (sectionId) {
                    var result = [];
                    _this.items.forEach(function (item) {
                        if (item.section && item.section == sectionId) {
                            result.push(item);
                        }
                    });
                    return result;
                };
                this.getItemsBySectionIdAndDate = function (sectionId, dateFrom, dateTo) {
                    var result = [];
                    _this.items.forEach(function (item) {
                        if (item.section && item.section == sectionId) {
                            result.push(item);
                            return;
                        }
                        if (item.date) {
                            var date = _this.convertToDate(item.date);
                            if (date >= dateFrom && date <= dateTo)
                                result.push(item);
                        }
                    });
                    return result;
                };
                this.getItemById = function (id) {
                    for (var i = 0; i < _this.items.length; i++) {
                        var item = _this.items[i];
                        if (item.id == id)
                            return item;
                    }
                    return null;
                };
                this.getColumnById = function (id) {
                    for (var i = 0; i < _this.columns.length; i++) {
                        var column = _this.columns[i];
                        if (column.id == id)
                            return column;
                    }
                    return null;
                };
                this.getSectionById = function (id) {
                    for (var i = 0; i < _this.columns.length; i++) {
                        for (var j = 0; j < _this.columns[i].sections.length; j++) {
                            var section = _this.columns[i].sections[j];
                            if (section.id == id)
                                return section;
                        }
                    }
                    return null;
                };
                this.getColumnByIndex = function (index) {
                    return _this.columns[index];
                };
                this.getSectionByIndex = function (columnIndex, index) {
                    return _this.columns[columnIndex].sections[index];
                };
                this.getTotalColumns = function () {
                    return _this.columns.length;
                };
                this.getTotalItems = function () {
                    return _this.items.length;
                };
                this.getTotalItemsValue = function (sectionId) {
                    var result = 0;
                    _this.getItemsBySectionId(sectionId).forEach(function (item) {
                        result += item.value;
                    });
                    return result;
                };
                this.getTotalColumnCapacity = function (columnId) {
                    var result = 0;
                    _this.getColumnById(columnId).sections.forEach(function (section) {
                        result += section.capacity;
                    });
                    return result;
                };
                this.updateItem = function (item) {
                    for (var i = 0; i < _this.items.length; i++) {
                        if (_this.items[i].id == item.id) {
                            _this.items[i] = item;
                            return;
                        }
                    }
                    _this.items.push(item);
                };
                this.items = items;
                this.columns = columns;
            }
            return DataManager;
        }());
        var EStackedBarCore = (function () {
            function EStackedBarCore(baseElement, options) {
                var _this = this;
                this.sectionHeight = 0;
                this.availableSectionHeight = 0;
                this.getMainFrame = function () {
                    return $(".esb-main-frame", _this.baseElement);
                };
                this.setDataSource = function (dataSource) {
                    _this.dataManager = new DataManager(dataSource.items, dataSource.columns);
                };
                this.findColumnElementByItemElement = function (itemElement) {
                    var column = itemElement;
                    for (var i = 0; i < 4; i++) {
                        column = column.parent();
                        if (column.hasClass("esb-column"))
                            break;
                    }
                    return column;
                };
                this.findSectionElementByItemElement = function (itemElement) {
                    var section = itemElement;
                    for (var i = 0; i < 4; i++) {
                        section = section.parent();
                        if (section.hasClass("esb-section"))
                            break;
                    }
                    return section;
                };
                this.findColumnElementById = function (id) {
                    return $(".esb-column[data-id=" + id + "]", _this.getMainFrame());
                };
                this.findSectionElementById = function (id) {
                    return $(".esb-section[data-id=" + id + "]", _this.getMainFrame());
                };
                this.render = function () {
                    _this.baseElement.empty();
                    var mainFrame = $("<div>").addClass("esb-main-frame");
                    _this.baseElement.append(mainFrame);
                    // Columns
                    for (var i = 0; i < _this.dataManager.getTotalColumns(); i++) {
                        var column = _this.dataManager.getColumnByIndex(i);
                        _this.addColumn(column);
                        // Sections
                        for (var j = 0; j < column.sections.length; j++) {
                            var section = _this.dataManager.getSectionByIndex(i, j);
                            _this.addSectionToColumn(column, section);
                            // Items
                            var items = void 0;
                            if (section.dateFrom && section.dateTo)
                                items = _this.dataManager.getItemsBySectionIdAndDate(section.id, new Date(section.dateFrom), new Date(section.dateTo));
                            else
                                items = _this.dataManager.getItemsBySectionId(section.id);
                            for (var k = 0; k < items.length; k++) {
                                _this.addItemToSection(section, items[k]);
                            }
                        }
                        _this.recalculateSectionHeights(column.id);
                    }
                    _this.baseElement.append(mainFrame);
                };
                this.addColumn = function (column) {
                    var columnElement = $("<div>").attr("data-id", column.id).addClass("esb-column");
                    var columnWrapperElement = $("<div>").addClass("esb-column-wrapper");
                    if (column.header) {
                        var headerElement = $("<div>").addClass("esb-column-header");
                        var headerCellElement = $("<div>").addClass("esb-column-header-content");
                        headerCellElement.html(column.header);
                        headerElement.append(headerCellElement);
                        columnWrapperElement.append(headerElement);
                    }
                    var containerWrapperElement = $("<div>").addClass("esb-column-container");
                    columnWrapperElement.append(containerWrapperElement);
                    columnElement.append(columnWrapperElement);
                    _this.getMainFrame().append(columnElement);
                };
                this.addSectionToColumn = function (column, section) {
                    var columnContainerElement = $(".esb-column-container", _this.findColumnElementById(column.id));
                    var columnCapacity = _this.dataManager.getTotalColumnCapacity(column.id);
                    var sectionHeight = section.capacity / columnCapacity * 100;
                    if (section.capacity == columnCapacity && columnCapacity == 0)
                        sectionHeight = 100;
                    var sectionElement = $("<div>").attr("data-id", section.id).addClass("esb-section")
                        .css("height", sectionHeight + "%");
                    if (section.class)
                        sectionElement.addClass(section.class);
                    var contentWrapperElement = $("<div>").addClass("esb-section-content-wrapper");
                    var contentElement = $("<div>").addClass("esb-section-content");
                    // Grids
                    if (section.grid_lines && section.grid_lines > 0) {
                        var gridLineSize = 100 / section.grid_lines;
                        contentElement[0].appendChild(_this.generateGrids(gridLineSize, section.id));
                    }
                    // Gap
                    var itemGapElement = $("<div>").addClass("esb-item-gap");
                    contentElement.append(itemGapElement);
                    contentWrapperElement.append(contentElement);
                    if (section.header) {
                        var headerElement = $("<div>").addClass("esb-section-header");
                        var headerCellElement = $("<div>").addClass("esb-section-header-content");
                        headerCellElement.html(section.header);
                        headerElement.append(headerCellElement);
                        sectionElement.append(headerElement);
                    }
                    sectionElement.append(contentWrapperElement);
                    columnContainerElement.append(sectionElement);
                    if (section.droppable && section.droppable == true) {
                        contentElement.addClass("esb-content-droppable");
                        contentElement.droppable({
                            tolerance: "intersect",
                            accept: ".esb-item-draggable",
                            addClasses: false,
                            drop: function (event, ui) { _this.onDropped(event, ui); },
                        });
                    }
                };
                this.recalculateSectionHeights = function (columnId) {
                    var column = _this.dataManager.getColumnById(columnId);
                    var columnCapacity = _this.dataManager.getTotalColumnCapacity(column.id);
                    var totalHeight = 0;
                    for (var i = 0; i < column.sections.length; i++) {
                        var section = column.sections[i];
                        var sectionElement = _this.findSectionElementById(section.id);
                        var sectionHeight = 0;
                        if (i == column.sections.length - 1) {
                            sectionHeight = 100 - totalHeight;
                        }
                        else
                            sectionHeight = Math.ceil(section.capacity / columnCapacity * 100);
                        sectionElement.css("height", sectionHeight + "%");
                        totalHeight += sectionHeight;
                    }
                };
                this.addItemToSection = function (section, item) {
                    var sectionElement = _this.findSectionElementById(section.id);
                    var contentElement = $(".esb-section-content", sectionElement);
                    var sectionCapacity = section.capacity;
                    var itemHeight = item.value / sectionCapacity * 100;
                    var itemWrapperElement = $("<div>").attr("data-id", item.id).addClass("esb-item").addClass(item.class)
                        .css("height", itemHeight + "%");
                    var itemContentElement = $("<div>").addClass("esb-item-content").html(item.content);
                    itemWrapperElement.append(itemContentElement);
                    contentElement.append(itemWrapperElement);
                    if (item.draggable && item.draggable == true) {
                        itemWrapperElement.addClass("esb-item-draggable");
                        $(itemWrapperElement).draggable({
                            // containment: ".esb-main-frame",
                            helper: "clone",
                            revert: "invalid",
                            start: function (event, ui) { _this.onDragStart(event, ui); },
                            stop: function (event, ui) { _this.onDragStop(event, ui); }
                        });
                    }
                    if (item.resizable && item.resizable == true) {
                        itemWrapperElement.addClass("esb-item-resizable");
                        $(itemWrapperElement).resizable({
                            handles: "n",
                            start: function (event, ui) { _this.onResizeStart(event, ui); },
                            resize: function (event, ui) { _this.onResizing(event, ui); },
                            stop: function (event, ui) { _this.onResizeStop(event, ui); }
                        });
                    }
                };
                this.generateGrids = function (heightPercentage, id) {
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
                    rectElement.setAttribute("x", "0");
                    rectElement.setAttribute("y", heightPercentage + "%");
                    rectElement.setAttribute("width", "100%");
                    rectElement.setAttribute("height", "100%");
                    rectElement.setAttribute("fill", "url(#" + patternId + ")");
                    svgElement.appendChild(patternElement);
                    svgElement.appendChild(rectElement);
                    return svgElement;
                };
                this.onDragStart = function (event, ui) {
                    var element = $(event.target);
                    element.addClass("esb-item-drag-shadow");
                    $(ui.helper).width(element.width()).height(element.height());
                };
                this.onDragStop = function (event, ui) {
                    var element = $(event.target);
                    element.removeClass("esb-item-dragging-shadow");
                };
                this.onDropped = function (event, ui) {
                    var sectionElement = _this.findSectionElementByItemElement($(event.target));
                    var sectionId = sectionElement.attr("data-id");
                    var itemElement = $(ui.draggable);
                    var itemId = itemElement.attr("data-id");
                    var section = _this.dataManager.getSectionById(sectionId);
                    var item = _this.dataManager.getItemById(itemId);
                    // Check overflow
                    var isOverflowAllowed = section.overflow && section.overflow == true;
                    var totalItemValues = _this.dataManager.getTotalItemsValue(sectionId);
                    if (!isOverflowAllowed && totalItemValues + item.value > section.capacity)
                        return false;
                    // Update data source
                    item.section = sectionId;
                    _this.dataManager.updateItem(item);
                    // Update ui
                    var itemHeight = item.value / section.capacity * 100;
                    itemElement.css("height", itemHeight + "%");
                    $(".esb-item-gap", event.target).after(itemElement);
                };
                this.onResizeStart = function (event, ui) {
                    var itemElement = $(ui.element);
                    var sectionElement = _this.findSectionElementByItemElement(itemElement);
                    var sectionContentElement = $(".esb-section-content", sectionElement);
                    var totalItemsHeight = 0;
                    $(".esb-item", sectionContentElement).each(function (index, siblingItemElement) {
                        if ($(siblingItemElement).attr("data-id") != itemElement.attr("data-id"))
                            totalItemsHeight += $(itemElement).height();
                    });
                    _this.sectionHeight = sectionContentElement.height();
                    _this.availableSectionHeight = _this.sectionHeight - totalItemsHeight;
                };
                this.onResizing = function (event, ui) {
                    var itemElement = $(ui.element);
                    itemElement.css("top", "");
                    var sectionElement = _this.findSectionElementByItemElement(itemElement);
                    var section = _this.dataManager.getSectionById(sectionElement.attr("data-id"));
                    var itemValue = itemElement.height() / _this.sectionHeight * section.capacity;
                    // Snap to grid
                    var gridSize = section.capacity / section.grids;
                    itemValue = Math.floor(itemValue / gridSize) * gridSize;
                    var totalItemsValue = itemValue;
                    $(".esb-item", sectionElement).each(function (index, obj) {
                        var siblingItemId = $(obj).attr("data-id");
                        if (itemElement.attr("data-id") != siblingItemId) {
                            var siblingItem = _this.dataManager.getItemById(siblingItemId);
                            totalItemsValue += siblingItem.value;
                        }
                    });
                    if (totalItemsValue > section.capacity || itemElement.height() > _this.availableSectionHeight) {
                        itemValue = section.capacity - (totalItemsValue - itemValue);
                    }
                    var itemHeight = itemValue / section.capacity * 100;
                    itemElement.css("height", itemHeight + "%");
                };
                this.onResizeStop = function (event, ui) {
                    var itemElement = $(ui.element);
                    var sectionElement = _this.findSectionElementByItemElement(itemElement);
                    var section = _this.dataManager.getSectionById(sectionElement.attr("data-id"));
                    var itemId = itemElement.attr("data-id");
                    var item = _this.dataManager.getItemById(itemId);
                    item.value = itemElement.height() / _this.sectionHeight * section.capacity;
                    _this.dataManager.updateItem(item);
                };
                this.initialiseBaseElement(baseElement);
                this.mapOptions(options);
                this.render();
            }
            EStackedBarCore.prototype.initialiseBaseElement = function (baseElement) {
                this.baseElement = baseElement;
                this.baseElement[0]["EStackedBar"] = this;
                this.baseElement.addClass("estackedbar");
            };
            EStackedBarCore.prototype.mapOptions = function (options) {
                if (options.hasOwnProperty("dataSource") != null)
                    this.setDataSource(options.dataSource);
                if (options.hasOwnProperty("onItemMoved") != null)
                    this.onItemMoved = options.onItemMoved;
                if (options.hasOwnProperty("onItemResizing") != null)
                    this.onItemResizing = options.onItemResizing;
                if (options.hasOwnProperty("onItemResized") != null)
                    this.onItemResized = options.onItemResized;
                if (options.hasOwnProperty("onOverflow") != null)
                    this.onOverflow = options.onOverflow;
            };
            EStackedBarCore.prototype.triggerItemMoved = function () {
                if (this.onItemMoved)
                    return this.onItemMoved({ dataManager: this.dataManager }, { baseElement: this.baseElement });
                return null;
            };
            EStackedBarCore.prototype.triggerItemResizing = function () {
                if (this.onItemResizing)
                    return this.onItemResizing({ dataManager: this.dataManager }, { baseElement: this.baseElement });
                return null;
            };
            EStackedBarCore.prototype.triggerItemResized = function () {
                if (this.onItemResized)
                    return this.onItemResized({ dataManager: this.dataManager }, { baseElement: this.baseElement });
                return null;
            };
            EStackedBarCore.prototype.triggerOverflow = function () {
                if (this.onOverflow)
                    return this.onOverflow({ dataManager: this.dataManager }, { baseElement: this.baseElement });
                return null;
            };
            return EStackedBarCore;
        }());
        EStackedBarControl.EStackedBarCore = EStackedBarCore;
    })(EStackedBarControl = EControls.EStackedBarControl || (EControls.EStackedBarControl = {}));
})(EControls || (EControls = {}));
var EStackedBar = EControls.EStackedBarControl.EStackedBarCore;
//# sourceMappingURL=EstackedBar.js.map