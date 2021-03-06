﻿var pages = {
    0: {
        width: '612pt',
        height: '792pt'
    },//A2
    1: {
        width: '841.8898pt',
        height: '1190.55pt'
    },//A3
    2: {
        width: '595.276pt',
        height: '841.8898pt'
    },//A4      
    3: {
        width: '419.5276',
        height: '595.276pt'
    },//A5 
    4: {
        width: '612pt',
        height: '792pt'
    },//letter
};
var ruler = {
    px: {
        minor: "tickMinor",
        major: "tickMajor",
        label: "tickLabel",
        len: 5
    },
    cm: {
        minor: "tickMinor-cm",
        major: "tickMajor-cm",
        label: "tickLabel-cm",
        len: 3.77
    },
    inch: {
        minor: "tickMinor-inch",
        major: "tickMajor-inch",
        label: "tickLabel-inch",
        len: 9.6
    }
}
var summaryFunc = {
    0:"Average",
    1:"Count",
    2:"Max",
    3:"Min",
    4:"Sum"
}
var RptBuilder = function (refid, ver_num, type, dsobj, cur_status, tabNum, ssurl) {
    this.EbObject = dsobj;
    this.Rel_object;
    this.objCollection = {};
    this.splitarray = [];
    this.btn_indx = null;
    this.sectionArray = [];
    this.RefId = refid;
    this.height = null;
    this.width = null;
    this.type = 2;
    this.rulertype = "cm";
    this.copyStack = null;
    this.copyORcut = null;
    this.idCounter = {
        EbDataFieldTextCounter: 0,
        EbDataFieldDateTimeCounter: 0,
        EbDataFieldBooleanCounter: 0,
        EbDataFieldNumericCounter: 0,
        EbDataFieldSummaryCounter:0,
        EbTableCounter: 0,
        EbImgCounter: 0,
        EbDateTimeCounter: 0,
        EbPageXYCounter: 0,
        EbPageNoCounter: 0,
        EbTextCounter: 0,
        EbBarcodeCounter: 0,
        EbQRcodeCounter: 0,
        EbWaterMarkCounter: 0,
        EbCircleCounter: 0,
        EbRectCounter: 0,
        EbArrRCounter: 0,
        EbArrLCounter: 0,
        EbArrUCounter: 0,
        EbArrDCounter: 0,
        EbByArrHCounter: 0,
        EbByArrVCounter: 0,
        EbHlCounter: 0,
        EbVlCounter: 0,
    };

    this.subSecIdCounter = {
        Countrpthead: 1,
        Countpghead: 1,
        Countdetail: 1,
        Countpgfooter: 1,
        Countrptfooter: 1
    };

    this.EbObjectSections = {
        ReportHeader: 'rpthead',
        PageHeader: 'pghead',
        ReportDetail: 'detail',
        PageFooter: 'pgfooter',
        ReportFooter: 'rptfooter'
    };

    this.msBoxSubNotation = {
        rpthead: 'Rh',
        pghead: 'Ph',
        detail: 'Dt',
        pgfooter: 'Pf',
        rptfooter: 'Rf'
    };

    this.RefreshControl = function (obj) {
        var NewHtml = obj.$Control.outerHTML();
        var metas = AllMetas["Eb" + $("#" + obj.EbSid).attr("eb-type")];
        $.each(metas, function (i, meta) {
            var name = meta.name;
            if (meta.IsUIproperty) {
                NewHtml = NewHtml.replace('@' + name + ' ', obj[name]);
            }
        });
        $("#" + obj.EbSid).replaceWith(NewHtml);

        if (!('SectionHeight' in obj)) {
            $("#" + obj.EbSid).draggable({
                cursor: "crosshair", containment: ".page",
                start: this.onDrag_Start.bind(this), stop: this.onDrag_stop.bind(this), drag: this.ondragControl.bind(this)
            });
            $("#" + obj.EbSid).off('focusout').on("focusout", this.destroyResizable.bind(this));
        }
        if ('SectionHeight' in obj) {
            $("#" + obj.EbSid).droppable({ accept: ".draggable,.dropped,.coloums", drop: this.onDropFn.bind(this) });
        }
        $("#" + obj.EbSid).attr("tabindex", "1");
        $("#" + obj.EbSid).off("focus").on("focus", this.elementOnFocus.bind(this));
    };//render after pgchange

    this.convertTopoints = function (val) {
        var pixel = val;
        var point = (pixel * 72) / 96;
        return point;
    }

    this.getDataSourceColoums = function (refid) {
        if (refid !== "") {
            $('#data-table-list').empty();
            $("#get-col-loader").show();
            $.ajax({
                url: "../RB/GetColumns",
                type: "POST",
                cache: false,
                data: { refID: refid },
                success: function (result) {
                    $("#get-col-loader").hide();
                    DrawColTree(result);
                    $('.nav-tabs a[href="#data"]').tab('show');
                }
            });
        }
    };//ajax for ds coloums

    this.ruler = function () {
        var width = null;
        var k = 0;
        var j = 0;
        var pxlabel = 1;
        if (this.rulertype == "px") { pxlabel = 5; }
        if (this.width.substring(0, this.width.length - 2) > 595.276) { width = ($('#PageContainer').width() - 79) + 'px'; }
        else { width = this.width; }
        $('.ruler,.rulerleft').show();
        var $ruler = $('.ruler').css({ "width": width });
        for (var i = 0, step = 0; i < $ruler.innerWidth() / ruler[this.rulertype].len; i++ , step++) {
            var $tick = $('<div>');
            if (step === 0) {
                if (this.rulertype === "px") {
                    $tick.addClass(ruler[this.rulertype].label).html(i * 5);
                }
                else { $tick.addClass(ruler[this.rulertype].label).html(j++); }

            } else if ([1, 3, 5, 7, 9].indexOf(step) > -1) {
                $tick.addClass(ruler[this.rulertype].minor);
                if (step === 9) {
                    step = -1;
                }
            } else {
                $tick.addClass(ruler[this.rulertype].major);
            }
            $ruler.append($tick);
        }

        var $rulerleft = $('.rulerleft').css({ "height": this.height });
        for (i = 0, step = 0; i < $rulerleft.innerHeight() / ruler[this.rulertype].len; i++ , step++) {
            $tick = $('<div>');
            if (step === 0) {
                if (this.rulertype === "px") {
                    $tick.addClass(ruler[this.rulertype].label).html(i * 5);
                }
                else { $tick.addClass(ruler[this.rulertype].label).html(k++); }

            } else if ([1, 3, 5, 7, 9].indexOf(step) > -1) {
                $tick.addClass(ruler[this.rulertype].minor);
                if (step === 9) {
                    step = -1;
                }
            } else {
                $tick.addClass(ruler[this.rulertype].major);
            }
            $rulerleft.append($tick);
        }
    };

    this.createPage = function () {
        this.createHeaderBox();
        $("#PageContainer").append(`<div class='page' id='page' style='position:relative;width:${this.width};height:${this.height}'>`);
        $(".page").resizable({
            handles: "s",
            resize: this.onPageResize.bind(this)
        });
        this.pageSplitters();
    };
    this.onPageResize = function () {
        $('.headersections,.multiSplit').css("height", $('.page').height());
        $(".rulerleft").css("height", $('.page').height());
    }

    this.createHeaderBox = function () {
        $("#PageContainer").append(`<div class='headersections' style='height:${this.height};'></div>
                                    <div class='multiSplit' id='multiSplit' style='height:${ this.height};'></div>`);
        for (var i = 0; i < 5; i++) {
            $("#multiSplit").append(`<div class='multiSplitHbox' data_val='${i}' eb-type='MultiSplitBox' id='box${i}' style='width: 100%;'></div>`);
        }
    };

    this.pushSubsecToRptObj = function (sections, obj) {
        if (sections === 'ReportHeader')
            this.EbObject.ReportHeaders.push(obj);      
        else if (sections === 'PageHeader')
            this.EbObject.PageHeaders.push(obj);
        else if (sections === 'ReportFooter')
            this.EbObject.ReportFooters.push(obj);
        else if (sections === 'PageFooter')
            this.EbObject.PageFooters.push(obj);
        else if (sections === 'ReportDetail')
            this.EbObject.Detail.push(obj);
    };

    this.pageSplitters = function () {
        var j = 0;
        for (var sections in this.EbObjectSections) {
            $("#page").append(`<div class='${sections}s' eb-type='${sections}' id='${this.EbObjectSections[sections]}' 
            data_val='${j++}' style='width :100%;position: relative'> </div>`);
            this.sectionArray.push("#" + this.EbObjectSections[sections]);
            //zero section adding by default.              
            var SubSec_obj = new EbObjects["Eb" + sections](this.EbObjectSections[sections] + "0");
            $("#" + this.EbObjectSections[sections]).append(SubSec_obj.$Control.outerHTML());
            SubSec_obj.SectionHeight = "100%";
            SubSec_obj.BackColor = "transparent";
            this.objCollection[this.EbObjectSections[sections] + "0"] = SubSec_obj;
            this.RefreshControl(SubSec_obj);
            this.pg.addToDD(SubSec_obj);
            this.pushSubsecToRptObj(sections, SubSec_obj);//push subsec to report object.         
        }
        this.repExtern.headerSecSplitter(this.sectionArray);
        this.headerBox1_Split();
    };//add page sections

    this.headerBox1_Split = function () {
        for (i = 0; i < 5; i++) {
            $(".headersections").append("<div class='head_Box1' id='" + this.sectionArray[i].slice(1) + "Hbox' data-index='" + i + "' style='width :100%'>"
                + "<p>" + this.msBoxSubNotation[this.sectionArray[i].slice(1)] + "</p></div>");
        }
        this.headerScaling();
        this.splitButton();
    };

    this.headerScaling = function () {
        var _this = this;
        this.repExtern.multisplit();
        this.repExtern.box();
        $(".multiSplit").children().not(".gutter").each(this.setFirstMsSubBoxDiv.bind(this));
    };

    this.setFirstMsSubBoxDiv = function (boxsub, obj) {
        var id = this.sectionArray[boxsub].slice(1) + "subBox" + 0;
        $(obj).append("<div class='multiSplitHboxSub' eb-type='MultiSplitBox' id='" + id + "' style='width: 100%;height:100%'>"
            + "<p> " + this.msBoxSubNotation[this.sectionArray[boxsub].slice(1)] + "0" + " </p></div>");
        var focid = id.substring(0, id.indexOf('s')) + id.slice(-1);
        $("#" + id).attr("onclick", "$('#" + focid + "').focus();");
    };

    this.splitButton = function () {
        $('.headersections').children().not(".gutter").each(this.addButton.bind(this));
    };

    this.addButton = function (i, obj) {
        $(obj).append("<button class='btn btn-xs'  id='btn" + i + "'><i class='fa fa-plus'></i></button>");
        $('#btn' + i).off("click").on("click", this.splitDiv.bind(this));
    };//split button

    this.splitDiv = function (e) {
        this.splitarray = [];
        this.btn_indx = $(e.target).parent().parent().attr("data-index");
        $.each($('.page').children().not(".gutter"), this.splitDiv_inner.bind(this));
    };

    this.splitDiv_inner = function (i, obj) {
        if ($(obj).attr('data_val') === this.btn_indx) {
            this.$sec = $("#" + obj.id);
            var id = obj.id + (this.subSecIdCounter["Count" + obj.id])++;
            var objType = $(obj).attr("eb-type");
            this.$sec.children('.gutter').remove();
            var SubSec_obj = new EbObjects["Eb" + objType](id);
            this.$sec.append(SubSec_obj.$Control.outerHTML());
            SubSec_obj.BackColor = "transparent";
            this.objCollection[id] = SubSec_obj;
            this.RefreshControl(SubSec_obj);
            this.pg.addToDD(SubSec_obj);
            this.pushSubsecToRptObj(objType, SubSec_obj);//push subsec to report object.
            $.each(this.$sec.children().not(".gutter"), this.splitMore.bind(this));
            this.repExtern.splitGeneric(this.splitarray);
            this.multiSplitBoxinner();
        }
    };//split sections multipple

    this.splitMore = function (i, obj) {
        this.splitarray.push("#" + obj.id);
    };//subsection pushed into split array 

    this.multiSplitBoxinner = function () {
        var index = this.btn_indx;
        var temp1 = [];
        var msBoxSubNotationTemp = this.msBoxSubNotation;
        var SecArray = this.sectionArray;
        var flagsuccess = false;
        $('.multiSplit').children(".multiSplitHbox").eq(this.btn_indx).children('.gutter').remove();
        $('.multiSplit').children(".multiSplitHbox").each(function (i, obj) {
            $('.page').children().not(".gutter").each(function (j, obj2) {
                var count = $(obj2).children().not(".gutter").length;
                if ($(obj).attr("data_val") === $(obj2).attr("data_val") && index === $(obj).attr("data_val")) {
                    var id = obj2.id + "subBox" + (count - 1);
                    $(obj).append("<div class='multiSplitHboxSub' eb-type='MultiSplitBox' id='" + id + "' style='width: 100%;'>"
                        + "<p> " + msBoxSubNotationTemp[obj2.id] + (count - 1) + " </p></div>");
                    var focid = id.substring(0, id.indexOf('s')) + id.slice(-1);
                    $("#" + id).attr("onclick", "$('#" + focid + "').focus();");
                    $.each($(obj).children().not(".gutter"), function (i, object) { temp1.push("#" + object.id); });
                    flagsuccess = true;
                    return false;
                }
            });
            if (flagsuccess)
                return false;
        });
        if (temp1 !== null) {
            this.repExtern.splitGeneric(temp1);
        }
    };

    this.DragDrop_Items = function () {
        this.posLeft = null;
        this.posTop = null;
        this.font = null;
        this.reDragLeft = null;
        this.reDragTop = null;
        $('.draggable').draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            appendTo: "body",
            drag: function (event, ui) {
                $(ui.helper).css({ "background": "white", "border": "1px dotted black", "width": "auto" });
                $(ui.helper).children(".shape-text").remove();
                $(ui.helper).children().find('i').css({ "font-size": "50px", "background-color": "transparent" });
            },
            start: this.dragStartFirst.bind(this),
        });
    };//drag drop starting func

    this.dragStartFirst = function (event, ui) {
        this.positionTandL = {};
        this.positionTandL['left'] = event.pageX - $(event.target).offset().left;
        this.positionTandL['top'] = event.pageY - $(event.target).offset().top;
    };

    this.onDropFn = function (event, ui) {
        this.posLeft = event.pageX;
        this.posTop = event.pageY;
        this.dropLoc = $(event.target);
        this.col = $(ui.draggable);
        this.Objtype = this.col.attr('eb-type');
        var Title = "";
        if (this.Objtype === 'DateTime')
            Title = this.addCurrentDateTime();
        else if (this.Objtype === 'DataFieldText' || this.Objtype === 'DataFieldDateTime' || this.Objtype === 'DataFieldBoolean' || this.Objtype === 'DataFieldNumeric')
            Title = "T" + this.col.parent().parent().siblings("a").text().slice(-1) + "." + this.col.text().trim();
        else
            Title = this.col.text().trim();
        if (!this.col.hasClass('dropped')) {
            var Objid = this.Objtype + (this.idCounter["Eb" + this.Objtype + "Counter"])++;
            var obj = new EbObjects["Eb" + this.Objtype](Objid);
            this.dropLoc.append(obj.$Control.outerHTML());
            if (this.col.hasClass('coloums')) {
                obj.Top = (this.posTop - this.dropLoc.offset().top) - PosOBjOFdrag['top'];
                obj.Left = (this.posLeft - this.dropLoc.offset().left) - PosOBjOFdrag['left'];
            }
            else {
                obj.Top = (this.posTop - this.dropLoc.offset().top) - this.positionTandL['top'];
                obj.Left = (this.posLeft - this.dropLoc.offset().left) - this.positionTandL['left'];
            }
            obj.Title = Title;
            this.objCollection[Objid] = obj;
            this.RefreshControl(obj);
        }
        else if (this.col.hasClass('dropped')) {
            this.dropLoc.append(this.col.css({ left: (this.posLeft - this.dropLoc.offset().left) - this.reDragLeft, top: (this.posTop - this.dropLoc.offset().top) - this.reDragTop }));
            var obj1 = this.objCollection[this.col.attr('id')];
            obj1.Top = this.col.position().top;
            obj1.Left = this.col.position().left;
        }
    };//on drop func of dropable

    this.onReSizeFn = function (event, ui) {
        var resizeId = $(event.target).attr("id");
        this.objCollection[resizeId].Width = $(event.target).width();
        this.objCollection[resizeId].Height = $(event.target).height();
        this.RefreshControl(this.objCollection[resizeId]);
        var type = $(event.target).attr('eb-type');
        this.pg.setObject(this.objCollection[resizeId], AllMetas["Eb" + type]);
    };//on resize event

    this.elementOnFocus = function (event) {
        event.stopPropagation();
        var curControl = $(event.target);
        var id = curControl.attr("id");
        var curObject = this.objCollection[id];
        var type = curControl.attr('eb-type');
        this.pg.setObject(curObject, AllMetas["Eb" + type]);
        if (!curControl.hasClass("pageHeaders")) {
            this.editElement(curControl);
            this.Resizable(curControl);
        }
        this.contextMenu(curControl, curObject);
    };//obj send to pg on focus

    this.Resizable = function (object) {
        if (object.hasClass("Ebshapes")) {
            if (object.attr("eb-type") === "ArrR" || object.attr("eb-type") === "ArrL") {
                this.resizing(object, "e,w");
            }
            else if (object.attr("eb-type") === "ArrU" || object.attr("eb-type") === "ArrD") {
                this.resizing(object, "n, s");
            }
            else if (object.attr("eb-type") === "ByArrH" || object.attr("eb-type") === "Hl") {
                this.resizing(object, "e,w");
            }
            else if (object.attr("eb-type") === "ByArrV" || object.attr("eb-type") === "Vl") {
                this.resizing(object, "n, s");
            }
            else {
                this.resizing(object, "n, s,e,w, ne, se, sw, nw");
            }
        }
        else {
            this.resizing(object, "n, s,e,w, ne, se, sw, nw");
        }
    };

    this.resizing = function (object, handles) {
        object.resizable({
            containment: "parent", handles: handles, stop: this.onReSizeFn.bind(this)
        });
    };

    this.destroyResizable = function (event) {
        $(event.target).resizable("destroy");
    }

    this.contextMenu = function (curControl, curObject) {
        this.curObject = curObject;
        var selector = curControl.attr('id');
        this.itemsDisabled = {};
        $.contextMenu({
            selector: '#' + selector,
            autoHide: true,
            items: {
                "copy": { name: "Copy", icon: "copy", callback: this.contextMenucopy.bind(this) },
                "cut": { name: "Cut", icon: "cut", callback: this.contextMenucut.bind(this) },
                "paste": { name: "Paste", icon: "paste", callback: this.contextMenupaste.bind(this) },
                "delete": { name: "Delete", icon: "delete", callback: this.contextMenudelete.bind(this) },
                "lock": { name: "Lock", icon: "fa-lock", callback: this.lockControl.bind(this) },
                "unlock": { name: "unlock", icon: "fa-unlock", callback: this.unLockControl.bind(this) },
                "summary": { name: "Summary", icon: "fa-cog", callback: this.addSummeryField.bind(this) },
                "fold1": {
                    "name": "Text Align", icon: "fa-text",
                    "items": {
                        "Align Left": { name: "Align Left", icon: "fa-align-left", callback: this.contextMenuLeft.bind(this) },
                        "Align Right": { name: "Align Right", icon: "fa-align-right", callback: this.contextMenuRight.bind(this) },
                        "Align Center": { name: "Align Center", icon: "fa-align-center", callback: this.contextMenuCenter.bind(this) },
                        "Align Justify": { name: "Align Justify", icon: "fa-align-justify", callback: this.contextMenuJustify.bind(this) },
                    }
                }
            }
        });
    };

    this.contextMenucopy = function (eType, selector, action, originalEvent) {
        if (!$(selector.selector).hasClass("pageHeaders")) {
            this.copyStack = this.objCollection[$(selector.selector).attr('id')];
            this.copyORcut = 'copy';
        }
        else
            alert("section cannot copy!")
    };
    this.contextMenucut = function (eType, selector, action, originalEvent) {
        if (!$(selector.selector).hasClass("pageHeaders")) {
            this.copyStack = this.objCollection[$(selector.selector).attr('id')];
            this.copyORcut = 'cut';
            $(selector.selector).remove();
        }
        else
            alert("section cannot cut!")
    };
    this.contextMenupaste = function (eType, selector, action, originalEvent) {
        if (this.copyStack === null) { alert('no item copied'); }
        else {
            var copy = this.copyStack;
            var Objid = null;
            var Objtype = $("#" + copy.EbSid).attr('eb-type');
            if (this.copyORcut === 'copy') {
                Objid = Objtype + (this.idCounter["Eb" + Objtype + "Counter"])++;
                copy.EbSid = Objid;
                copy.Name = Objid;
            }
            else if (this.copyORcut === 'cut') {
                Objid = copy.EbSid;
            }
            copy.Top = action.originalEvent.pageY - $(selector.selector).offset().top;
            copy.Left = action.originalEvent.pageX - $(selector.selector).offset().left;
            $(selector.selector).append(copy.Html());
            this.objCollection[Objid] = copy;
            this.RefreshControl(copy);
            this.copyStack = null;
            this.copyORcut = null;
        }
    };
    this.contextMenudelete = function (eType, selector, action, originalEvent) {
        if (!$(selector.selector).hasClass("pageHeaders")) {
            $(selector.selector).remove();
        }
        else
            alert('no permission');
    };
    this.contextMenuJustify = function (eType, selector, action, originalEvent) {
        $(selector.selector).css("text-align", "justify");
    };
    this.contextMenuRight = function (eType, selector, action, originalEvent) {
        $(selector.selector).css("text-align", "right");
    };
    this.contextMenuCenter = function (eType, selector, action, originalEvent) {
        $(selector.selector).css("text-align", "center");
    };
    this.contextMenuLeft = function (eType, selector, action, originalEvent) {
        $(selector.selector).css("text-align", "left");
    };
    this.lockControl = function (eType, selector, action, originalEvent) {
        if (!$(selector.selector).hasClass("pageHeaders")) {
            $(selector.selector).addClass('locked').draggable('disable');
        }
        else if ($(selector.selector).hasClass("pageHeaders")) {
            $(selector.selector).addClass('locked').droppable({
                disabled: true
            });
            $(selector.selector).children().each(function (i, obj) { $("#" + obj.id).addClass('locked').draggable('disable'); });
            var locksymbDiv = $(selector.selector).attr("id").slice(0, -1) + 'subBox' + $(selector.selector).attr('id').slice(-1);
            $('#' + locksymbDiv).append('<i class="fa fa-lock lock-icon" aria-hidden="true"></i>');
            if ($(selector.selector).siblings().length === 0) {
                $('#btn' + $(selector.selector).attr("data_val")).attr('disabled', 'disabled');
            }
            $(selector.selector).parent().next('.gutter').css({ "cursor": "not-allowed", "pointer-events": "none" });
            $(selector.selector).parent().prev('.gutter').css({ "cursor": "not-allowed", "pointer-events": "none" });
        }
    };
    this.unLockControl = function (eType, selector, action, originalEvent) {
        if (!$(selector.selector).hasClass("pageHeaders")) {
            $(selector.selector).removeClass('locked').draggable('enable');
        }
        else if ($(selector.selector).hasClass("pageHeaders")) {
            $(selector.selector).removeClass('locked').droppable({
                disabled: false
            });
            $(selector.selector).children().each(function (i, obj) { $("#" + obj.id).removeClass('locked').draggable('enable'); });
            var locksymbDiv = $(selector.selector).attr("id").slice(0, -1) + 'subBox' + $(selector.selector).attr('id').slice(-1);
            $('#' + locksymbDiv).children("i").remove();
            if ($(selector.selector).siblings().length === 0) {
                $('#btn' + $(selector.selector).attr("data_val")).removeAttr('disabled');
            }
            $(selector.selector).parent().next().css({ "cursor": "ns-resize", "pointer-events": "auto" });
            $(selector.selector).parent().prev('.gutter').css({ "cursor": "ns-resize", "pointer-events": "auto" });
        }
    };

    this.addSummeryField = function (eType, selector, action, originalEvent) {
        $("#summarry-editor-modal-container").modal("toggle");
        this.selector = selector;
        this.$funcselect = $("#summarry-editor-modal-container #summary-func").empty();
        this.$sectionselect = $("#summarry-editor-modal-container #summary-sections").empty();      
        var sections = this.getSectionToAddSum($(selector.selector));
        if ($(selector.selector).hasClass("EbCol")) {            
            $("#summarry-editor-modal-container #summary-fieldname").val($(selector.selector).text().trim()); 
            for (var func in summaryFunc) {
                this.$funcselect.append(`<option 
                value="${summaryFunc[func]}">${summaryFunc[func]}</option>`);
            }
            for (var i = 0; i < sections.length;i++) {
                this.$sectionselect.append(`<option 
                value="#${sections[i].attr("id")}">${sections[i].attr("eb-type") + sections[i].attr("id").slice(-1)}</option>`);
            }
            $("#submit-summary").off("click").on("click", this.appendSummaryField.bind(this));
        }
    };

    this.appendSummaryField = function (e) {    
        $("#summarry-editor-modal-container").modal("toggle");
        var Objid = "DataFieldSummary" + this.idCounter["EbDataFieldSummaryCounter"]++;
        var obj = new EbObjects["EbDataFieldSummary"](Objid);
        $(this.$sectionselect.val()).append(obj.$Control.outerHTML());
        obj.DataField = $(this.selector.selector).text().trim();
        obj.Title = this.$funcselect.val()+"("+$(this.selector.selector).text().trim()+")";
        obj.Function = this.$funcselect.val();
        obj.Left = this.objCollection[$(this.selector.selector).attr("id")].Left;      
        this.objCollection[Objid] = obj;
        this.RefreshControl(obj);
        $("#running-summary ul[id='running-summary-childul']").append("<li class='styl'><div tabindex='1' $(this).focus(); class='textval'> "
            + this.$funcselect.val() + "(" + $(this.selector.selector).text().trim() + ")" + "</div></li>");        
    };

    this.getSectionToAddSum = function (selector) {
        var objlist = [];
        selector.parent().parent().nextAll().not(".gutter,#detail").each(function (i, obj) {
            $(obj).children().not(".gutter").each(function (j, sections) {
                objlist.push($(sections));
            })
        })
        return objlist;
    };

    this.editElement = function (control) {
        this.control = control;
        control.on('keydown', this.keyBoardShortcuts.bind(this));
    };//control edit options

    this.keyBoardShortcuts = function (event) {
        if (event.key === "Delete")
            this.control.remove();
        else if (event.key === "Control")
            this.control.toggleClass("marked");
    };

    this.removeElementFn = function (e) {
        if (!$(e.target).hasClass("pageHeaders"))
            this.control.remove();
        else
            alert("no permission");
    };

    this.addImageFn = function (obj) {
        obj.Background = 'url(' + 'http://eb_roby_dev.localhost:5000/static/' + obj.Image + '.JPG) center no-repeat';
        RefreshControl(obj);
    };

    this.addWaterMarkFn = function (obj) {
        obj.Background = 'url(' + 'http://eb_roby_dev.localhost:5000/static/' + obj.Image + '.JPG) center no-repeat';
        RefreshControl(obj);
    }

    this.addCurrentDateTime = function () {
        var currentdate = new Date();
        var time = currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear() + " @ "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();
        return time;
    };

    this.onDrag_stop = function (event, ui) {
        $('#guid-v , #guid-h, #guid-vr, #guid-hb').remove();
        var dragId = $(event.target).attr("id");
        var type = $(event.target).attr('eb-type');
        this.pg.setObject(this.objCollection[dragId], AllMetas["Eb" + type]);
    };//drag start fn of control

    this.ondragControl = function (event, ui) {
        $('#guid-v , #guid-h, #guid-vr, #guid-hb').show();
        $('#guid-v').css({ 'left': (event.pageX - $('.page').offset().left) - (this.reDragLeft + 3) });
        $('#guid-h').css({ 'top': (event.pageY - $('.page').offset().top) - (this.reDragTop + 3) });
        $('#guid-vr').css({ 'left': ((event.pageX - $('.page').offset().left) - (this.reDragLeft + 3)) + ($(event.target).width() + 5) });
        $('#guid-hb').css({ 'top': ((event.pageY - $('.page').offset().top) - (this.reDragTop + 3)) + ($(event.target).height() + 5) });
    };

    this.onDrag_Start = function (event, ui) {
        this.reDragLeft = event.pageX - $(event.target).offset().left;
        this.reDragTop = event.pageY - $(event.target).offset().top;
        $('.page').prepend("<div class='vL' id='guid-v' style='z-index:3;border-left: 1px dashed #55f;height:100%;position:absolute;display:none'></div>"
            + "<div class='hL' id='guid-h' style='z-index:3;border-top: 1px dashed #55f;width:100%;position:absolute;display:none'></div>"
            + "<div class='vr' id='guid-vr' style='z-index:3;border-left: 1px dashed #55f;height:100%;position:absolute;display:none'></div>"
            + "<div class='hb' id='guid-hb' style='z-index:3;border-top: 1px dashed #55f;width:100%;position:absolute;display:none'></div>");
    };//drag stop fn of control

    this.savefile = function () {
        this.EbObject.Height = parseInt(this.height.slice(0, -2));
        this.EbObject.Width = parseInt(this.width.slice(0, -2));
        this.EbObject.PaperSize = this.type;
        $.each($('.page').children().not(".gutter"), this.findPageSections.bind(this));
        commonO.Current_obj = this.EbObject;
    };//save

    this.findPageSections = function (i, sections) {
        this.sections = $(sections).attr('id');
        $.each($("#" + this.sections).children().not(".gutter"), this.findPageSectionsSub.bind(this));
    };//........save/commit

    this.findPageSectionsSub = function (j, subsec) {
        this.subsec = $(subsec).attr("id");
        var eb_type = $(subsec).attr("eb-type");
        this.j = j;
        this.objCollection[this.subsec].Width = this.convertTopoints($("#" + this.subsec).width());
        this.objCollection[this.subsec].Height = this.convertTopoints($("#" + this.subsec).height());
        $.each($("#" + this.subsec).children(), this.findPageElements.bind(this));
    };//.........save/commit

    this.findPageElements = function (k, elements) {
        var elemId = $(elements).attr('id');
        var eb_typeCntl = $("#" + this.subsec).attr("eb-type");
        this.objCollection[elemId].Width = this.convertTopoints(this.objCollection[elemId].Width);
        this.objCollection[elemId].Height = this.convertTopoints(this.objCollection[elemId].Height);
        this.objCollection[elemId].Left = this.convertTopoints(this.objCollection[elemId].Left);
        this.objCollection[elemId].Top = this.convertTopoints(this.objCollection[elemId].Top);

        if (eb_typeCntl === 'ReportHeader') {
            this.EbObject.ReportHeaders[this.j].Fields.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'PageHeader') {
            this.EbObject.PageHeaders[this.j].Fields.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'ReportFooter') {
            this.EbObject.ReportFooters[this.j].Fields.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'PageFooter') {
            this.EbObject.PageFooters[this.j].Fields.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'ReportDetail') {
            this.EbObject.Detail[this.j].Fields.push(this.objCollection[elemId]);
        }
    };//........save/commit

    this.Commit = function () {
        this.EbObject.Height = parseInt(this.height.slice(0, -2));
        this.EbObject.Width = parseInt(this.width.slice(0, -2));
        this.EbObject.PaperSize = this.type;
        $.each($('.page').children().not(".gutter"), this.findPageSections.bind(this));
        commonO.Current_obj = this.EbObject;
    };//commit

    this.setpageSize = function (obj) {
        this.type = obj.PaperSize;
        if (obj.PaperSize !== 5) {
            this.height = pages[this.type].height;
            this.width = pages[this.type].width;
            $('.ruler,.rulerleft').empty();
            this.ruler();
            $(".headersections,.multiSplit").css({ "height": this.height });
            $("#page").css({ "height": this.height, "width": this.width });
        }
        else if (obj.PaperSize === 5) {
            if (obj.CustomPaperHeight !== 0 && obj.CustomPaperWidth !== 0) {
                this.height = obj.CustomPaperHeight;
                this.width = obj.CustomPaperWidth;
                $('.ruler,.rulerleft').empty();
                this.ruler();
                $(".headersections,.multiSplit").css({ "height": this.height });
                $("#page").css({ "height": this.height, "width": this.width });
            }
        }
    };//page size change fn

    this.setpageMode = function (obj) {
        if (obj.IsLandscape === true) {
            this.height = pages[this.type].width;
            this.width = pages[this.type].height;
        }
        else if (obj.IsLandscape === false) {
            this.height = pages[this.type].height;
            this.width = pages[this.type].width;
        }
        $('.ruler,.rulerleft').empty();
        this.ruler();
        $(".headersections,.multiSplit").css({ "height": this.height });
        $("#page").css({ "height": this.height, "width": this.width });
    };//page layout lands/port

    this.setSplitArrayFSec = function (i, obj) {
        this.idArray.push("#" + obj.id);
        var size = (($(obj).height() / $(obj).parent().height()) * 100) + 1.2;
        this.sizeArray.push(size);
        $(obj).siblings(".gutter").remove();
    };//section split for pg change

    this.rulerChangeFn = function (e) {
        this.rulertype = $(e.target).val();
        $('.ruler,.rulerleft').empty();
        this.ruler();
    };

    this.changeSummaryFunc = function (obj) {
        obj.Title = obj.Title.replace(obj.Title.substr(0, obj.Title.indexOf('(')), summaryFunc[obj.Function]);
    };

    this.minimap = function () {
        var previewPage = $('.page').minimap({
            heightRatio: 0.25,
            widthRatio: 0.1,
            offsetHeightRatio: 0.7,
            offsetWidthRatio: 0.02,
            position: "left",
            touch: true,
            smoothScroll: true,
            smoothScrollDelay: 200,
        });
    };

    this.init = function () {
        this.repExtern = new ReportExtended();
        this.pg = new Eb_PropertyGrid("propGrid");
        if (this.EbObject === null) {
            this.EbObject = new EbObjects["EbReport"]("Report1");
            this.height = pages[this.type].height;
            this.width = pages[this.type].width;
            this.EbObject.PaperSize = this.type;
            this.pg.setObject(this.EbObject, AllMetas["EbReport"]);
            this.pg.addToDD(this.EbObject);
            $('#PageContainer,.ruler,.rulerleft').empty();
            this.ruler();
            this.createPage();
            this.DragDrop_Items();
            //this.minimap();
        }
        else { }
        this.pg.PropertyChanged = function (obj, pname) {
            if ('SectionHeight' in obj) {
                this.sizeArray = [];
                this.idArray = []
                $("#" + obj.EbSid).parent().children().not(".gutter").each(this.setSplitArrayFSec.bind(this));
                this.RefreshControl(obj);
                this.repExtern.splitGeneric(this.idArray, this.sizeArray);
            }
            else if (pname === "DataSourceRefId") {
                this.getDataSourceColoums(obj.DataSourceRefId);
            }
            else if (pname === "PaperSize") {
                this.setpageSize(obj);
            }
            else if (pname === "IsLandscape") {
                this.setpageMode(obj);
            }
            else if (pname === "Image") {
                this.addImageFn(obj);
            }
            else if (pname === "WaterMark") {
                this.addWaterMarkFn(obj);
            }
            else if (pname === "Function") {
                this.changeSummaryFunc(obj);
                this.RefreshControl(obj);
            }
            else {
                this.RefreshControl(obj);
            }
        }.bind(this);
        $("#rulerUnit").on('change', this.rulerChangeFn.bind(this));
    };//report execution start func
    this.init();
};
//background image
var setBackgroud = function (input) {
    console.log(input);
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#page').css({ 'background-image': 'url(' + e.target.result + ')', 'width': $('#page').width(), 'background-repeat': 'no-repeat' });
        };
        reader.readAsDataURL(input.files[0]);
    }
};

