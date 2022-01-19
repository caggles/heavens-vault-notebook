$(document).ready(function(){

    // create the global vocab list and symbol translations
    let vocab = cookieload("vocab");
    let symbols = cookieload("symbols");

    if (vocab == null) {
        vocab = [];
    }
    if (symbols == null) {
        symbols = [];
    }

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

    // listener for each symbol button on the symbols page
    $("button.ancient.symbol").click(function(){
        $("div.detail-name").html($(this).text());
        clear();
        $("div.word-delete").hide();
        $("div#vocabdetail").show();
        $("div.detail-translations").hide();
        $("td.containedby_close").hide();
        $("td.contains_exact").hide();
        $("td.contains_close").hide();
        wordlist($(this).text(), "parent", "exact", "td.containedby_exact", "Words containing this letter...");

    });

    // listener for clicking one of the ancient keys on the keyboard
    $("button.ancient.keyboard").click(function(){
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
        clear();
        $("div#vocabdetail").show();
        wordlist(word.name, "child", "exact", "td.contains_exact", "Contains the exact words...");
        wordlist(word.name, "child", "close", "td.contains_close", "Contains the similar words...");
        wordlist(word.name, "parent", "exact", "td.containedby_exact", "Is contained within the exact words...");
        wordlist(word.name, "parent", "close", "td.containedby_close", "Is contained within the similar words...");
        basictranslations(word);
        detailtranslations(word);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });

    // generates a listener for the button to delete a word from your vocabulary
    $('div.word-delete').on('click', 'button', function(){
        let confirmed = confirm("This will delete this ancient word from your vocabulary, including all translations. Are you sure?");
        if (confirmed) {
            let wordindex = vocab.findIndex((o) => { return o['name'] === $("div.detail-name").html() });
            vocab.splice(wordindex, 1);
            showvocablist();
            cookiesave();
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }
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
            cookiesave();
        } else {
            notify('You cannot delete the only translation of an ancient word. Please add a new one before trying to delete this one.')
        }
    });

    // listener for the clear button on the keyboard, to clear current ancient typing (and some other stuff)
    $("button#clear").click(function(){
        showkeyboard();
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
            clear();
            $("div#addword").show();
            cookiesave();
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
        cookiesave();
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
        try {
            let load_text = JSON.parse($("#load_box").val());
            if (load_text.hasOwnProperty('vocab') && load_text.hasOwnProperty('symbols')) {
                vocab = load_text['vocab'];
                symbols = load_text['symbols'];
                $("#load_box").val("");
                $("div.modal").hide();
                showvocablist();
                cookiesave();
            } else {
                notify("Your load file is malformed and can't be loaded.")
            }
        } catch (e) {
            notify("Your load file is malformed and can't be loaded.")
        }
    });

    // listener for the close button for both the save and load boxes
    $("span.close").click(function(){
        $("div.modal").hide();
    });


    ///////////////////////////////////////////////////
    //                  FUNCTIONS                    //
    ///////////////////////////////////////////////////

    // reset everything to the base visual appearance.
    function clear() {
        $("div#addword").hide();
        $("div#vocablist").hide();
        $("div#vocabdetail").hide();
        $("div#symbols").hide();
        $("div.word-delete").show();
        $("div.detail-translations").show();
        $("td.containedby_exact").show();
        $("td.containedby_close").show();
        $("td.contains_exact").show();
        $("td.contains_close").show();
        $("#target").text("");
        $("#translation").val("");
        $("td.contains_exact").html("");
        $("td.contains_close").html("");
        $("td.containedby_exact").html("");
        $("td.containedby_close").html("");
        $("div.detail-translations").html("");
    }

    // display the keyboard div and hide the others
    function showkeyboard() {
        clear();
        $("div#addword").show();
    }

    // display the vocab list div and hide the others
    function showvocablist() {
        clear();
        $("div#vocablist").show();
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
        clear();
        $("div#symbols").show();
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

            if (title) {
                $(target + ' table').append($(document.createElement('tr')).prop({class: 'vocab-titles'}));
                $(target + ' table:last-child tr:last-child').append($(document.createElement('td')).prop({class: 'table-info', innerHTML: 'Vocabulary Size: ' + vocab.length + ' words.'}));
                $(target + ' table:last-child tr:last-child').append($(document.createElement('td')).prop({class: 'table-info', innerHTML: ''}));
                $(target + ' table:last-child').append($(document.createElement('tr')).prop({class: 'vocab-titles'}));
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
        $("div.detail-name").html(word.name);
        let button = $(document.createElement('button'));
        button.prop({class: 'word_delete', innerHTML: "delete"});
        $("div.word-delete").html(button);
        $("div.detail-translations").html('<h3>Translations</h3>');
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

        if (childlist.length < 1 && symbol_trans.length < 1) {
            $("div.detail-translations").append($(document.createElement('p')).prop({class: 'translations', innerHTML: ""}));
        }
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
    function cookiesave(){
        try {
            localStorage.setItem("vocab", JSON.stringify(vocab));
            localStorage.setItem("symbols", JSON.stringify(symbols));
        } catch (e) {
            notify("There was an autosave error! You should save manually. <br />" + e)
        }

    }

    // some old options  for loading via cookie, now unused.
    function cookieload(item) {
        let stringy_item = localStorage.getItem(item);
        return JSON.parse(stringy_item);
    }


});
