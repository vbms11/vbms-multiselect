$.widget("custom.multiSelect",{
    
    // default options
    options: {
	width : "400",
	height : "200",
        autoResize : false,
	language : 'en',
        header : true,
        selectAll : true,
        search : true,
        orientation : "left",
        searchPosition : "right"
    },
    
    container : null,
    
    // the constructor
    _create: function () {
        
        // attach the multiSelect
        this.attach();
        this.resize(this.options.width, this.options.height);
        
        this._refresh();
    },
    
    // called when created, and later when changing options
    _refresh : function () {
        
        this._trigger("refreshEvent");
    },

    // revert modifications here
    _destroy : function () {
        
        this.detach();
    },

    // _setOptions is called with a hash of all options that are changing
    _setOptions : function () {
        
        this._superApply(arguments);
        this._refresh();
    },

    // _setOption is called for each individual option that is changing
    _setOption : function (key, value) {
        
        switch (key) {
            case "width":
                this.resize(value,this.options.height);
                break;
            case "height":
                this.resize(this.options.width,value);
                break;
            default:
                this._super(key,value);
        }
    },
    
    /*
     * Multi Select Methods
     */
    
    // add the multi select
    attach : function () {
        
        if (!this.element.hasClass("multiSelect")) {
            this.element.addClass("multiSelect");
            
            var thisObject = this;
            this.container = $("<div>",{"class":"multiSelectContainer"});
            
            // create search panel
            var searchControls = null;
            if (this.options.search) {
                searchControls = $("<div>",{"class":"multiSelectSearch"})
                    .append($("<input>",{"type":"textfeild"})
                        .keyup(function (e) {
                            thisObject.filterOptions($(this).val());
                        })
                    );
            }
            
            // add left panel
            var leftContainer = $("<div>",{"class":"multiSelectLeftContainer"});
            if (this.options.header) {
                var header = $("<div>",{"class":"ui-widget-header multiSelectHeader"});
                if (this.options.selectAll) {
                    var selectAll = $("<a>",{"class":"multiSelectSelectionTools"});
                    if (this.options.orientation === "left") {
                        selectAll.click(function (e) {
                            thisObject.removeAll();
                            return false;
                        }).text("remove all");
                    } else {
                        selectAll.click(function (e) {
                            thisObject.addAll();
                            return false;
                        }).text("select all");
                    }
                    header.append(selectAll);
                }
                if (this.options.search && this.options.searchPosition === "left") {
                    header.append(searchControls); 
                }
                leftContainer.append(header);    
            }
            leftContainer.append($("<div>",{"class":"multiSelectLeft"})
                .append($("<div>",{"class":"multiSelectItemContainer"}))
            ).appendTo(this.container);
            
            // add right panel
            var rightContainer = $("<div>",{"class":"multiSelectRightContainer"});
            if (this.options.header) {
                var header = $("<div>",{"class":"ui-widget-header multiSelectHeader"});
                if (this.options.selectAll) {
                    var selectAll = $("<a>",{"class":"multiSelectSelectionTools"});
                    if (this.options.orientation === "right") {
                        selectAll.click(function (e) {
                            thisObject.removeAll();
                            return false;
                        }).text("remove all");
                    } else {
                        selectAll.click(function (e) {
                            thisObject.addAll();
                            return false;
                        }).text("select all");
                    }
                    header.append(selectAll);
                }
                if (this.options.search && this.options.searchPosition === "right") {
                    header.append(searchControls); 
                }
                rightContainer.append(header);    
            }
            rightContainer.append(
                $("<div>",{"class":"multiSelectRight"})
                    .append($("<div>",{"class":"multiSelectItemContainer"}))
                ).appendTo(this.container);
            
            // add resize listener
            if (this.options.autoResize) {
                this.container.on("resize",function (e) {
                    thisObject.resize(thisObject.container.outerWidth(),thisObject.container.outerHeight() + 1);
                });
            }
            
            // add option items
            this.refreshItems();
            
            // make sortable
            this.container.find(".multiSelectLeft .multiSelectItemContainer, .multiSelectRight .multiSelectItemContainer").sortable({
                connectWith : ".multiSelectItemContainer",
                items : ".multiSelectItem",
                update: function (event, ui) {
                    thisObject.updateItemState(ui.item);
                    thisObject.updateOptionPositions();
                }
            });
            
            // add after select element
            this.element.after(this.container);
        }
    },
    
    // remove the multi select
    detach : function () {
        
        this.element
            .removeClass("multiSelect")
            .next()
            .sortable("destroy")
            .remove();
    },
    
    // resize the multi select
    resize : function (width, height) {
        
        // save width and height
        this.options.width = width;
        this.options.height = height;
        
        // set the containers size
        this.container
            .width(width - 2)
            .height(height - 2);
        
        // set the item containers height
        var selectPanelHeight = height - 2;
        this.container.find(".multiSelectLeftContainer, .multiSelectRightContainer").height(selectPanelHeight);
        if (this.options.header) {
            selectPanelHeight -= this.container.find(".multiSelectHeader").height() + 1;
        }
        this.container.find(".multiSelectLeft, .multiSelectRight").height(selectPanelHeight);
        
        // set the item containers width
        var fHalfWidth = Math.floor((width - 2) / 2);
        var rightWidth = width === fHalfWidth * 2 ? fHalfWidth - 2 : fHalfWidth - 1;
        this.container.find(".multiSelectLeft, .multiSelectLeftContainer").width(fHalfWidth);
        this.container.find(".multiSelectRight, .multiSelectRightContainer").width(rightWidth);
    },
    
    // refresh the selection state from the select element
    refreshItems : function () {
        
        var thisObject = this;
        
        // remove old items
        this.container.find(".multiSelectLeft .multiSelectItemContainer, .multiSelectRight .multiSelectItemContainer").empty();
        
        // populate panels with the option items
        $(this.element.find("option")).each(function (index, object) {
            var item = $("<div>",{"class":"ui-state-default multiSelectItem"})
                .attr({"value":$(object).attr("value")})
                .text($(object).html())
                .append($("<div>",{"class":"multiSelectItemTool ui-icon"}));
            if ($(object).attr("selected") !== undefined) {
                thisObject.getSelectedPanel().append(item
                    .find(".multiSelectItemTool")
                    .addClass("ui-icon-minus")
                    .click(function (e) {
                        thisObject.removeItem($(this).parent(".multiSelectItem"));
                    }).end()
                );    
            } else {
                thisObject.getOptionsPanel().append(item
                    .find(".multiSelectItemTool")
                    .addClass("ui-icon-plus")
                    .click(function (e) {
                        thisObject.addItem($(this).parent(".multiSelectItem"));
                    }).end()
                );
            }
        });
    },
    
    // filters the items to show if they contain the parameter
    filterOptions : function (search) {
        
        $.each(this.getOptionsPanel().find(".multiSelectItem"), function (index, object) {
            if ($(object).text().toLowerCase().search(search.toLowerCase()) === -1) {
                $(object).hide();
            } else {
                $(object).show();
            }
        });
    },
    
    // make all items selected
    addAll : function () {
        
        this.element.find("option").attr({"selected":"true"});
        this.refreshItems();
    },
    
    // make all items unselected
    removeAll : function () {
        
        this.element.find("option").removeAttr("selected");
        this.refreshItems();
    },
    
    // make an option selected by item
    addItem : function (item) {
        
        var thisObject = this;
        item.slideUp("fast", function () {
            thisObject.getSelectedPanel().prepend(item.remove());
            thisObject.updateItemStateAsSelected(item);
            item.slideDown("fast", function () {
                thisObject.updateOptionPositions();
            });
        });
    },
    
    // make an option unselected by item
    removeItem : function (item) {
        
        var thisObject = this;
        item.slideUp("fast", function () {
            thisObject.getOptionsPanel().prepend(item.remove());
            thisObject.updateItemStateAsOption(item);
            item.slideDown("fast", function () {
                thisObject.updateOptionPositions();
            });
        });
    },
    
    // update item state from item element
    updateItemState : function (item) {
        
        if (this.options.orientation === "left") {
            if (item.parents(".multiSelectLeft").size() > 0) {
                this.updateItemStateAsSelected(item);
            } else {
                this.updateItemStateAsOption(item);
            }
        } else {
            if (item.parents(".multiSelectRight").size() > 0) {
                this.updateItemStateAsOption(item);
            } else {
                this.updateItemStateAsSelected(item);
            }
        }
    },
    
    // set item state to be an option item
    updateItemStateAsOption : function (item) {
        
        var thisObject = this;
        var itemTools = item.find(".multiSelectItemTool");
        if (itemTools.hasClass("ui-icon-minus")) {
            itemTools.removeClass("ui-icon-minus");
        }
        if (!itemTools.hasClass("ui-icon-plus")) {
            itemTools.addClass("ui-icon-plus");
        }
        itemTools.off("click");
        itemTools.on("click",function (e) {
            thisObject.addItem(item);
        });
    },
    
    // set item state to be a selected item
    updateItemStateAsSelected : function (item) {
        
        var thisObject = this;
        var itemTools = item.find(".multiSelectItemTool");
        if (itemTools.hasClass("ui-icon-plus")) {
            itemTools.removeClass("ui-icon-plus");
        }
        if (!itemTools.hasClass("ui-icon-minus")) {
            itemTools.addClass("ui-icon-minus");
        }
        itemTools.off("click");
        itemTools.on("click",function (e) {
            thisObject.removeItem(item);
        });
    },
    
    // refreshes the order of the options in the select according to item positions
    updateOptionPositions : function () {
        
        var thisObject = this;
        
        // refresh order of available options
        this.getOptionsPanel().find(".multiSelectItem").each(function (index,object) {
            thisObject.element.append(
                thisObject.element.find("option[value="+$(object).attr("value")+"]")
                    .removeAttr("selected")
                    .remove()
            );
        });
        
        // refresh order of selected options
        this.getSelectedPanel().find(".multiSelectItem").each(function (index,object) {
            thisObject.element.append(
                thisObject.element.find("option[value="+$(object).attr("value")+"]")
                    .attr({"selected" : "true"})
                    .remove()
            );
        });
    },
    
    // return selected item container
    getSelectedPanel : function () {
        
        if (this.options.orientation === "left") {
            return this.container.find(".multiSelectLeft .multiSelectItemContainer");
        }
        return this.container.find(".multiSelectRight .multiSelectItemContainer");
    },
    
    // return option item container
    getOptionsPanel : function () {
        
        if (this.options.orientation === "left") {
            return this.container.find(".multiSelectRight .multiSelectItemContainer");
        }
        return this.container.find(".multiSelectLeft .multiSelectItemContainer");
    }
    
});