function wl(testo) {
    console.log(testo);
}

var registrazioneJson;

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
        wl("Inizio");
        var jqxhr = $.getJSON("registrazione.json", function(json) {
                registrazioneJson = json;
                var parts = registrazioneJson["giorno"].split('/');
                dataGiorno = new Date(parts[2], parts[1] - 1, parts[0]);
                simValue = parseFloat(registrazioneJson["valore"]);
            })
            .always(function() {
                timer = setInterval(ciclaSimulazione, 1000);
            });

    }

    function btnStop() {
        wl("Fine");
        clearTimeout(timer);
        var dataGiornoStringa = formatDate(dataGiorno);
        $.ajax({
            type: "POST",
            url: "salva.php",
            data: { data: JSON.stringify({ 'giorno': dataGiornoStringa, 'valore': simValue.toFixed(2) }) },
            success: function(msg) {
                console.log(msg);
            },
            dataType: 'json'
        });

    }

    var formatDate = function(date) {
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        return day + '/' + (monthIndex + 1) + '/' + year;
    }

    var ciclaSimulazione = function() {
        let profiloOrario = [
            0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2,
            0, 0, 0, 0, 0, 0, 0, 1.5, 0, 0, 0, 0,
        ];

        let profiloSettimanale = [
            0.8, 1, 1, 0.8, 0.75, 1, 1.5
        ];

        let profiloMensile = [
            1, 1, 1, 1, 0.8, 0.8, 0.75, 0.7, 1, 1, 1, 1.25
        ];

        let profilo = new ProfiloMensile(profiloMensile, profiloSettimanale, profiloOrario);

        calcola(profilo, dataGiorno);
        dataGiorno = addDays(dataGiorno, 1);
    }

    var calcola = function(dati, giorno) {
        var mese = giorno.getMonth();
        var giornoSettimana = giorno.getDay();

        dati.profiloOrario.forEach(function(value) {
            simValue += value * dati.profiloMensile[mese] * dati.profiloSettimanale[giornoSettimana];
        });
        wl("Data: " + giorno + " | Risultato: " + simValue.toFixed(2));
    }
}

class ProfiloMensile {
    constructor(profiloMensile, profiloSettimanale, profiloOrario) {
        this.profiloMensile = profiloMensile;
        this.profiloSettimanale = profiloSettimanale;
        this.profiloOrario = profiloOrario;
    }
}

var addDays = function(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

var leggiRegistrazione = function(file) {
    $.getJSON(file, function(json) {
        registrazioneJson = json;
    });
}