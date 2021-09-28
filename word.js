class Word {
    constructor(name, translation) {
        this.name = name;
        this.translations = [translation];
    }

    static getChildWords(word, vocab) {

        let exactchildlist = [];
        let closechildlist = [];

        for (let x in vocab) {

            let subword = vocab[x].name.slice(1, vocab[x].name.length-1);

            //get the exact match child words
            if (word.includes(vocab[x].name) && vocab[x].name !== word) {
                exactchildlist.push(vocab[x])

            //get child words that look similar but aren't exact (aka only first/last letter are different)
            } else if (word.includes(subword) && subword !== "" && subword !== "." && subword !== ":" && vocab[x].name !== word) {
                closechildlist.push(vocab[x])
            }
        }

        let childdict = {
            exact: exactchildlist,
            close: closechildlist
        };

        return childdict;
    }

    static getParentWords(word, vocab) {

        let exactparentlist = [];
        let closeparentlist = [];

        let subword = word.slice(1, word.length-1);

        for (let x in vocab) {

            //get the exact match parent words
            if (vocab[x].name.includes(word) && vocab[x].name !== word) {
                exactparentlist.push(vocab[x])

            //get parent words that look similar but aren't exact (aka only first/last letter are different)
            } else if (vocab[x].name.includes(subword) && subword !== "" && subword !== "." && subword !== ":" && vocab[x].name !== word) {
                closeparentlist.push(vocab[x])
            }
        }

        let parentdict = {
            exact: exactparentlist,
            close: closeparentlist
        };

        return parentdict;
    }
}