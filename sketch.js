var jsonStringa;
var sim;

function setup() {
    noCanvas();
    let startbutton = select('#startbutton');
    let stopbutton = select('#stopbutton');
    var timer;

    var simValue = 0;
    var giorno = 0;
    var dataGiorno;

    startbutton.mousePressed(btnSimula);
    stopbutton.mousePressed(btnStop);

    function btnSimula() {
        // LEGGI JSON
        var jqxhr = $.getJSON("registrazione.json", function (json) {
            jsonStringa = json;
            var parts = jsonStringa["giorno"].split('/');
            dataGiorno = new Date(parts[2], parts[1] - 1, parts[0]);
            simValue = parseFloat(jsonStringa["valore"]);
        })
            .always(function () {

                // SETTA SIMULAZIONE
                let profiloOrario = [
                    0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2,
                    0, 0, 0, 0, 0, 0, 0, 1.5, 0, 0, 0, 0
                ];

                let profiloSettimanale = [
                    0.8, 1, 1, 0.8, 0.75, 1, 1.5
                ];

                let profiloMensile = [
                    1, 1, 1, 1, 0.8, 0.8, 0.75, 0.7, 1, 1, 1, 1.25
                ];

                let profiloannuale = new ProfiloAnnuale(profiloMensile, profiloSettimanale, profiloOrario);

                sim = new Simulazione(dataGiorno, simValue, profiloannuale);

                timer = setInterval(ciclaSimulazione, 1000);
            });

    }

    function btnStop() {
        clearTimeout(timer);
        $.ajax({
            type: "POST",
            url: "salva.php",
            data: { data: JSON.stringify({ 'giorno': sim.getGiorno(), 'valore': sim.getValore() }) },
            success: function (msg) {
                console.log(msg);
            },
            dataType: 'json'
        });

    }


    var ciclaSimulazione = function () {
        sim.calculate();
    }
}

class ProfiloAnnuale {
    constructor(profiloMensile, profiloSettimanale, profiloOrario) {
        this.profiloMensile = profiloMensile;
        this.profiloSettimanale = profiloSettimanale;
        this.profiloOrario = profiloOrario;
    }
}

class Simulazione {
    constructor(data, valore, profilo) {
        this.giornoAttuale = data;
        this.valoreAttuale = valore;
        this.valoreLista = [];
        this.profilo = profilo;
    }

    setGiorno(data) {
        this.giornoAttuale = data;
    }

    addGiorno() {
        this.giornoAttuale.setDate(this.giornoAttuale.getDate() + 1);
    }

    getGiorno() {
        return formatDate(this.giornoAttuale);
    }

    getValore() {
        return this.valoreAttuale.toFixed(2);
    }

    addValore() {
        this.valoreLista.push(this.valoreAttuale.toFixed(2));
    }

    setValore(valore) {
        this.valoreAttuale = valore;
    }

    calculate() {
        this.addGiorno();
        
        for (let value of this.profilo.profiloOrario) {
            this.valoreAttuale += value * this.profilo.profiloMensile[this.giornoAttuale.getMonth()] * this.profilo.profiloSettimanale[this.giornoAttuale.getDay()];
        }

        this.getCurrent();
    }

    getCurrent() {
        console.log("Data: " + this.getGiorno() + " | Risultato: " + this.getValore());
    }
}

var leggiRegistrazione = function (file) {
    $.getJSON(file, function (json) {
        jsonStringa = json;
    });
}

var formatDate = function (date) {
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    return day + '/' + (monthIndex + 1) + '/' + year;
}