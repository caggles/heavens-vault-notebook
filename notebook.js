$(document).ready(function(){

    // create the global vocab list and symbol translations
    let vocab = [];
    let symbols = [];

    ///////////////////////////////////////////////////
    //                  LISTENERS                    //
    ///////////////////////////////////////////////////

    // listener for the button to show the keyboard
    $("button#toggleaddword").click(function(){
        showkeyboard();
    });

    // listener for the button to show the vocabulary list
    $("button#togglevocablist").click(function(){
        showvocablist();
    });

    // listener for the button to show the symbols list
    $("button#togglesymbols").click(function(){
        showsymbols();
    });

    // listener for the checkbox to show instructions
    $("input#instructionsbool").click(function(){
        $(".instructions").toggle(this.checked);
    });

    // listener for clicking one of the ancient keys on the keyboard
    $("button.ancient").click(function(){
        let letter = $(this).text();
        $("#target").text($("#target").text() + letter);
        wordlist($("#target").text(), "child", "exact", "td.contains_exact", "Contains the exact words...");
        wordlist($("#target").text(), "child", "close", "td.contains_close", "Contains the similar words...");
        wordlist($("#target").text(), "parent", "exact", "td.containedby_exact", "Is contained within the exact words...");
        wordlist($("#target").text(), "parent", "close", "td.containedby_close", "Is contained within the similar words...");
        let word = vocab.find((o) => { return o['name'] === $("#target").text() });
        if (word !== undefined) {
            $("div.detail-translations").html('<p><b>This word already exists in your vocabulary with the following translations: </b></p>');
            for (let x in word.translations) {
                $("div.detail-translations").append($(document.createElement('li')).prop({innerHTML: word.translations[x]}));
            }
        } else {
            $("div.detail-translations").html("<p><b>This is a new word not yet in your vocabulary.</b></p>");
        }
        detailtranslations({name: $("#target").text()});
    });

    // generates a listener for each ancient word in the vocab list, to allow the user to open more detailed information about said word
    $('div#vocablist, td.containedby_close, td.containedby_exact, td.contains_close, td.contains_exact').on('click', 'button', function(){
        let word = vocab.find((o) => { return o['name'] === this.textContent });
        wordlist(word.name, "child", "exact", "td.contains_exact", "Contains the exact words...");
        wordlist(word.name, "child", "close", "td.contains_close", "Contains the similar words...");
        wordlist(word.name, "parent", "exact", "td.containedby_exact", "Is contained within the exact words...");
        wordlist(word.name, "parent", "close", "td.containedby_close", "Is contained within the similar words...");
        basictranslations(word);
        detailtranslations(word);
        $("div#addword").hide();
        $("div#vocablist").hide();
        $("div#vocabdetail").show();
    });

    // generates a listener for each translation of an ancient word, which allows the user to delete a translation
    $('div.detail-translations').on('click', 'button', function(){
        let wordindex = vocab.findIndex((o) => { return o['name'] === $("div.detail-name").html() });
        let translation = this.dataset.translation;
        let word = vocab[wordindex];
        if (word.translations.length > 1) {
            word.translations.splice(vocab[wordindex].translations.indexOf(translation), 1);
            basictranslations(word);
            detailtranslations(word);
        } else {
            notify('You cannot delete the only translation of an ancient word. Please add a new one before trying to delete this one.')
        }
    });

    // listener for the clear button on the keyboard, to clear current ancient typing (and some other stuff)
    $("button#clear").click(function(){
        $("#target").text("");
        $("#translation").val("");
        $("td.contains_exact").html("");
        $("td.contains_close").html("");
        $("td.containedby_exact").html("");
        $("td.containedby_close").html("");
        $("div.detail-translations").html("");
    });

    // listener for the "add word" button on the keyboard, to add the current word and translation to the vocabulary
    $("button#add").click(function(){
        if ($("#translation").val().length > 0 && $("#target").text().length > 0) {
            let wordindex = vocab.findIndex((o) => { return o['name'] === $("#target").text() });
            if (wordindex < 0) {
                let newword = new Word($("#target").text(), $("#translation").val());
                vocab.push(newword);
                notify('<span class="ancient">' + newword.name + '</span> has been added to your vocabulary.');
            } else {
                vocab[wordindex].translations.push($("#translation").val());
                notify('A new translation for <span class="ancient">' + vocab[wordindex].name + '</span> has been added to your vocabulary.');
            }
            $("#target").text("");
            $("#translation").val("");
            $("td.contains_exact").html("");
            $("td.contains_close").html("");
            $("td.containedby_exact").html("");
            $("td.containedby_close").html("");
            $("div.detail-translations").html("");
        } else {
            notify("Both the ancient word and translation need to have at least one character. Please try again.")
        }
    });

    // listener to save the symbol translations
    $("button#symbol-save").click(function() {
        let temp_symbols = [];
        $(".symbol_entry").each(function() {
            let symbol = {"symbol": $('label[for="' + $(this).attr('id') + '"]').text(), "id": $(this).attr('id'), "translation": $(this).val()};
            temp_symbols.push(symbol);
        });
        symbols = temp_symbols;
    });

    // listener to open the save box
    $("button#save").click(function(){
        $("div#save_modal").show();
        let save_text = {'vocab': vocab, 'symbols': symbols};
        $("#save_box").val(JSON.stringify(save_text));
    });

    // listener to open the load box
    $("button#load").click(function(){
        $("div#load_modal").show();
    });

    // listener for the load button in the load box
    $("button#load_modal_button").click(function(){
        let load_text = JSON.parse($("#load_box").val());
        vocab = load_text['vocab'];
        symbols = load_text['symbols'];
        $("#load_box").val("");
        $("div.modal").hide();
        showvocablist();
    });

    // listener for the close button for both the save and load boxes
    $("span.close").click(function(){
        $("div.modal").hide();
    });


    ///////////////////////////////////////////////////
    //                  FUNCTIONS                    //
    ///////////////////////////////////////////////////

    // display the keyboard div and hide the others
    function showkeyboard() {
        $("div#addword").show();
        $("div#vocablist").hide();
        $("div#vocabdetail").hide();
        $("div#symbols").hide();
        $("#target").text("");
        $("td.contains_exact").html("");
        $("td.contains_close").html("");
        $("td.containedby_exact").html("");
        $("td.containedby_close").html("");
        $("div.detail-translations").html("");
    }

    // display the vocab list div and hide the others
    function showvocablist() {
        $("div#addword").hide();
        $("div#vocabdetail").hide();
        $("div#vocablist").show();
        $("div#symbols").hide();
        $("td.contains_exact").html("");
        $("td.contains_close").html("");
        $("td.containedby_exact").html("");
        $("td.containedby_close").html("");
        $("div.detail-translations").html("");
        vocab.sort(function(a, b){
              if (a.translations[0] < b.translations[0]) {return -1;}
              if (a.translations[0] > b.translations[0]) {return 1;}
              return 0;
        });
        $('#vocablist table').remove();
        generateList(vocab, "#vocablist", true);
    }

    // display the symbols div and hide the others
    function showsymbols() {
        $("div#addword").hide();
        $("div#vocablist").hide();
        $("div#vocabdetail").hide();
        $("div#symbols").show();
        $("td.contains_exact").html("");
        $("td.contains_close").html("");
        $("td.containedby_exact").html("");
        $("td.containedby_close").html("");
        $("div.detail-translations").html("");
        for (let x in symbols) {
            $("input#" + symbols[x]['id']).val(symbols[x]['translation'])
        }
    }

    // pop something up in the notification box
    function notify(html){
        $("#notification").show().html(html).delay(5000).fadeOut();
    }

    // generate the vocabulary list
    function generateList(objects, target, title) {
        if (objects.length > 0) {
            $(target).append($(document.createElement('table')));
            $(target + ' table').append($(document.createElement('tr')).prop({class: 'vocab-titles'}));
            if (title) {
                $(target + ' table:last-child tr:last-child').append($(document.createElement('td')).prop({class: 'table-title', innerHTML: 'Ancient Word'}));
                $(target + ' table:last-child tr:last-child').append($(document.createElement('td')).prop({class: 'table-title', innerHTML: 'Translations'}));
            }
            for (let x in objects) {
                $(target + ' table:last-child').append($(document.createElement('tr')).prop({class: 'vocab-entry'}));
                $(target + ' table:last-child tr:last-child').append($(document.createElement('td')).prop({class: 'table-name'}));
                $(target + ' table:last-child tr:last-child').append($(document.createElement('td')).prop({class: 'table-translations', innerHTML: objects[x].translations.join(', ')}));
                $(target + ' table:last-child tr:last-child td.table-name').append($(document.createElement('button')).prop({class: 'detail', innerHTML: objects[x].name}));
            }
        }
    }

    // print a word list with buttons in the relevant div/cell
    function wordlist(word_name, type, specificity, target, title) {
        let dict = {'exact': [], 'close': []};
        let nonehtml = '<table><tr class="vocab-entry"><td class="table-translations">none</td></tr>';

        if (type === "parent") {
            dict = Word.getParentWords(word_name, vocab);
        } else if (type === "child") {
            dict = Word.getChildWords(word_name, vocab);
        }

        $(target).html("");
        $(target).append($(document.createElement('p')).prop({innerHTML: '<b>' + title + '</b>'}));

        if (dict[specificity].length < 1) {
            $(target).append($(document.createElement('p')).prop({class: "relatedwords", innerHTML: nonehtml}));
        } else {
            generateList(dict[specificity], target, false);
        }
    }

    // basic/manual translations plus print the word real big.
    function basictranslations(word) {
        $("div.detail-translations").html('<h3>Translations</h3>');
        $("div.detail-name").html(word.name);
        for (let x in word.translations) {
            $("div.detail-translations").append($(document.createElement('p')).prop({class: 'translations', innerHTML: word.translations[x]}));
            let button = $(document.createElement('button'));
            button.prop({class: 'translation_delete', innerHTML: "delete"});
            button.attr("data-translation", word.translations[x]);
            $("div.detail-translations p:last-child").append(button);
        }
    }

    // print the detailed version of the translations in the relevant div.
    function detailtranslations(word) {

        $("div.detail-translations").append($(document.createElement('h3')).prop({innerHTML: 'Symbol Translations'}));

        // translation based on subwords
        let childdict = Word.getChildWords(word.name, vocab);
        let childlist = childdict['exact'];
        if (childlist.length < 1) {
            $("div.detail-translations").append($(document.createElement('p')).prop({class: 'translations', innerHTML: "none"}));
        }
        childlist.sort(function(a, b){
              if (a.name.length > b.name.length) {return -1;}
              if (a.name.length < b.name.length) {return 1;}
              return 0;
        });
        for (let y in childlist) {
            let sublist = childlist.slice(y);
            let subwordtranslation = translateword(sublist, word.name);
            $("div.detail-translations").append($(document.createElement('p')).prop({class: 'translations', innerHTML: subwordtranslation}));
        }

        // translation based on each symbol
        let symbol_trans = translatesymbol(word.name);
        $("div.detail-translations").append($(document.createElement('p')).prop({class: 'translations', innerHTML: symbol_trans}));
    }

    function translateword(childlist, word) {
        for (let y in childlist) {
            let index = word.indexOf(childlist[y].name);
            if (index >= 0) {
                let pre = word.substring(0, index);
                let post = word.substring(index + childlist[y].name.length, word.length);
                return translateword(childlist, pre) + "<div class='translation-word'><b>" + childlist[y].translations + "</b><span class='translation-tooltiptext ancient'>" + childlist[y].name + "</span></div> " + translateword(childlist, post);
            }
        }
        return translatesymbol(word);
    }

    function translatesymbol(word) {
        let symbol_trans = "";
        for (let letter in word) {
            let translation = symbols.find((o) => { return o['symbol'] === word[letter] });
            if (translation === undefined || translation['translation'] === "") {
                symbol_trans += "<div class='translation-word'>?<span class='translation-tooltiptext ancient'>" + translation['symbol'] + "</span></div> ";
            } else {
                symbol_trans += "<div class='translation-word'>" + translation['translation'] + "<span class='translation-tooltiptext ancient'>" + translation['symbol'] + "</span></div> ";
            }
        }
        return symbol_trans;
    }

    // some old options for saving via cookie, now unused.
    function cookiesave(vocab){
        let d = new Date();
        let exdays = 30;
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        let e = "expires="+ d.toUTCString();
        console.log(encodeURIComponent(JSON.stringify(vocab)));
        document.cookie = 'vocab='+ encodeURIComponent(JSON.stringify(vocab)) + ';' + e;
        console.log(document.cookie);
    }

    // some old options  for loading via cookie, now unused.
    function cookieload() {
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf('vocab') === 0) {
                let stringy = c.substring(6, c.length);
                console.log(decodeURIComponent(stringy));
                return JSON.parse(decodeURIComponent(stringy));
            }
            return [];
        }
    }


});
