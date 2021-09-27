$(document).ready(function(){

    // create the global vocab list
    let vocab = [];

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

    // listener for clicking one of the ancient keys on the keyboard
    $("button.ancient").click(function(){
        let letter = $(this).text();
        $("#target").text($("#target").text() + letter);
        contains($("#target").text());
        containedby($("#target").text());
        let word = vocab.find((o) => { return o['name'] === $("#target").text() });
        if (word !== undefined) {
            $("div.detail-translations").html('<b>This word already exists in your vocabulary with the following translations: </b><br /><br />');
            for (let x in word.translations) {
                $("div.detail-translations").append($(document.createElement('li')).prop({innerHTML: word.translations[x]}));
            }
        } else {
            $("div.detail-translations").html("<b>This is a new word not yet in your vocabulary.</b>");
        }
    });

    // generates a listener for each ancient word in the vocab list, to allow the user to open more detailed information about said word
    $('div#vocablist').on('click', 'button', function(){
        let word = vocab.find((o) => { return o['name'] === this.textContent });
        contains(word.name);
        containedby(word.name);
        detailtranslations(word);
        $("div#addword").hide();
        $("div#vocablist").hide();
        $("div#vocabdetail").show();
    });

    // generates a listener for each translation of an ancient word, which allows the user to delete a translation
    $('div.detail-translations').on('click', 'button', function(){
        let wordindex = vocab.findIndex((o) => { return o['name'] === $("div.detail-name").html() });
        let translation = this.dataset.translation;
        if (vocab[wordindex].translations.length > 1) {
            vocab[wordindex].translations.splice(vocab[wordindex].translations.indexOf(translation), 1);
            detailtranslations(vocab[wordindex]);
        } else {
            notify('You cannot delete the only translation of an ancient word. Please add a new one before trying to delete this one.')
        }
    });

    // listener for the clear button on the keyboard, to clear current ancient typing (and some other stuff)
    $("button#clear").click(function(){
        $("#target").text("");
        $("#translation").val("");
        $("div.contains-words").html("");
        $("div.contained-within").html("");
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
            $("div.contains-words").html("");
            $("div.contained-within").html("");
            $("div.detail-translations").html("");
        } else {
            notify("Both the ancient word and translation need to have at least one character. Please try again.")
        }

    });

    // listener to open the save box
    $("button#save").click(function(){
        $("div#save_modal").show();
        $("#save_box").val(JSON.stringify(vocab));
    });

    // listener to open the load box
    $("button#load").click(function(){
        $("div#load_modal").show();
    });

    // listener for the load button in the load box
    $("button#load_modal_button").click(function(){
        vocab = JSON.parse($("#load_box").val());
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
        $("#target").text("");
        $("div.contains-words").html("");
        $("div.contained-within").html("");
        $("div.detail-translations").html("");
    }

    // display the vocab list div and hide the others
    function showvocablist() {
        $("div#addword").hide();
        $("div#vocabdetail").hide();
        $("div#vocablist").show();
        $("div.contains-words").html("");
        $("div.contained-within").html("");
        $("div.detail-translations").html("");
        vocab.sort(function(a, b){
              if (a.translations[0] < b.translations[0]) {return -1;}
              if (a.translations[0] > b.translations[0]) {return 1;}
              return 0;
        });
        generateList(vocab, "#vocablist");
    }

    // pop something up in the notification box
    function notify(html){
        $("#notification").show().html(html).delay(5000).fadeOut();
    }

    // generate the vocabulary list
    function generateList(objects, target) {
        $(target + ' *').remove();
        if (objects.length > 0) {
            $(target).append($(document.createElement('table')));
            for (let x in objects) {
                $(target + ' table').append($(document.createElement('tr')).prop({class: 'vocab-entry'}));
                $(target + ' table tr:last-child').append($(document.createElement('td')).prop({class: 'table-name'}));
                $(target + ' table tr:last-child').append($(document.createElement('td')).prop({class: 'table-translations', innerHTML: objects[x].translations.join(', ')}));
                $(target + ' table tr:last-child td.table-name').append($(document.createElement('button')).prop({class: 'detail', innerHTML: objects[x].name}));
            }
        }
    }

    // print the 'contains words' list in the relevant divs.
    function contains(word_name) {
        let childdict = Word.getChildWords(word_name, vocab);
         $("div.contains-words").html("");
        $("div.contains-words").append($(document.createElement('h3')).prop({innerHTML: 'Contains the exact words....'}));
        for (let x in childdict['exact']) {
            $("div.contains-words").append($(document.createElement('p')).prop({innerHTML: '<span class="ancient">' + childdict['exact'][x].name + '</span> -- ' + childdict['exact'][x].translations.join(', ')}));
        }
        $("div.contains-words").append($(document.createElement('h3')).prop({innerHTML: 'Contains the similar words....'}));
        for (let x in childdict['close']) {
            $("div.contains-words").append($(document.createElement('p')).prop({innerHTML: '<span class="ancient">' + childdict['close'][x].name + '</span> -- ' + childdict['close'][x].translations.join(', ')}));
        }
    }

    // print the 'contained within' list in the relevant divs.
    function containedby(word_name) {
        let parentdict = Word.getParentWords(word_name, vocab);
        $("div.contained-within").html("");
        $("div.contained-within").append($(document.createElement('h3')).prop({innerHTML: 'Is contained within the exact words...'}));
        for (let x in parentdict['exact']) {
            $("div.contained-within").append($(document.createElement('p')).prop({innerHTML: '<span class="ancient">' + parentdict['exact'][x].name + '</span> -- ' + parentdict['exact'][x].translations.join(', ')}));
        }
        $("div.contained-within").append($(document.createElement('h3')).prop({innerHTML: 'Is contained within the similar words...'}));
        for (let x in parentdict['close']) {
            $("div.contained-within").append($(document.createElement('p')).prop({innerHTML: '<span class="ancient">' + parentdict['close'][x].name + '</span> -- ' + parentdict['close'][x].translations.join(', ')}));
        }
    }

    // print the detailed version of the translations in the relevant div.
    function detailtranslations(word) {
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
