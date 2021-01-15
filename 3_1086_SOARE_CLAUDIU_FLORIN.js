
const urlTari = './media/dateNecesare.json';
let tari;
async function aplicatie() {
    //vom prelua elementele din json 
    let raspuns = await fetch(urlTari);
    tari = await raspuns.json();

    //ne vom forma "select" ul pentru tari, fara a exista dubluri 
    let select = document.querySelector('#tari');
    let tariSelectate = [];
    for (let tara of tari) {

        let optiune = document.createElement('option');
        optiune.value = tara.tara;
        optiune.innerText = `${tara.tara}`;
        if (tariSelectate.includes(optiune.value) === false) {
            select.append(optiune);
            tariSelectate.push(optiune.value);

        }
    }
    //ne vom forma "select" ul pentru indicatori , fara a exista dubluri 
    let selectIndicatori = document.querySelector('#indicatori');
    let indicatoriSelectati = [];
    for (let tara of tari) {

        let optiune = document.createElement('option');
        optiune.value = tara.indicator;
        optiune.innerText = `${tara.indicator}`;
        if (indicatoriSelectati.includes(optiune.value) === false) {
            selectIndicatori.append(optiune);
            indicatoriSelectati.push(optiune.value);

        }

    }
    //ne vom forma "select" ul pentru ani, fara a exista dubluri . Acesta va fi folosit pentru tabel 
    let selectAni = document.querySelector('#ani');
    let aniSelectati = [];
    for (let tara of tari) {

        let optiune = document.createElement('option');
        optiune.value = tara.an;
        optiune.innerText = `${tara.an}`;
        if (aniSelectati.includes(optiune.value) === false) {
            selectAni.append(optiune);
            aniSelectati.push(optiune.value);

        }

    }
    //desenam graficul
    deseneazaGrafic();
    //desenam tabelul 
    deseneazaTabel();

    //de fiecare data cand schimbam tara se va redesena graficul 
    select.addEventListener('change', deseneazaGrafic);
    //de fiecare data cand schimbam indicatorul se va redesena graficul 
    selectIndicatori.addEventListener('change', deseneazaGrafic);
    //de fiecare data cand schimbam anul se va redesena tabeluld 
    selectAni.addEventListener('change', deseneazaTabel);
}

function deseneazaGrafic() {
    //cautam tara si indicatorul dorit 
    let tara = tari.find(item => item.tara === document.querySelector('#tari').value);
    let indicator = tari.find(item => item.indicator === document.querySelector('#indicatori').value);
    //ne creem un vector de valori in functie de tara si indicator care va fi afisat 
    let valoriBune = [];
    let j = 1
    let ok = true;
    let valori = tari.map(item => {
        for (let i = 0; i < tari.length; i++) {

            if (item.valoare !== null && item.tara === tara.tara && item.indicator === indicator.indicator) {
                if (ok) {
                    //primul element din vector nu se afiseaza niciodata 
                    //primul element al vectorului va fi egal cu al 2 lea , al doilea fiind de fapt primul care se va afisa 
                    //am facut asta pentru a avea un punct de plecare din svg  cu linia noastra 
                    valoriBune[0] = item.valoare;
                    ok = false;
                }
                //ne formam vectorul 
                valoriBune[j] = item.valoare;
                j++;

                return item.valoare;
            }
        }

    });

    let svg = document.querySelector('svg');
    svg.innerHTML = "";
    //ne luam variabilele care ne vor ajuta sa desenam in svg 
    let W = 300;
    let H = 200;
    //default, indicatorul va fi SV
    let valoareMaxima = 85;
    let valoareMinima = 68;
    //in functie de fiecare indicator,am luat un interval in care se incadreaza acele valori 
    if (indicator.indicator === "POP") {
        valoareMaxima = 84000000;
        valoareMinima = 300000;
    }
    if (indicator.indicator === "SV") {
        valoareMaxima = 85;
        valoareMinima = 68;
    }
    if (indicator.indicator === "PIB") {
        valoareMaxima = 85000;
        valoareMinima = 1000;
    }

    const n = valoriBune.length;
    const w = W / n;
    let tempX = 0;
    let tempY = 0;
    //incepem desenarea liniilor ,una dupa alta, pentru a forma graficul 
    //parcurgem vectorul de valori si pentru fiecare element desenam o polilinie 
    //fiecare polilinie va fi desenata in continuarea poliliniei precedentei
    for (let i = 0; i < n; i++) {
        let x = Math.round(i * w);
        let y = Math.round(H - (valoriBune[i] - valoareMinima) * H / (valoareMaxima - valoareMinima));
        let linie = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        linie.setAttribute('stroke', 'black');

        if (i == 0) {
            //aici sarim peste primul element din vector, pe care am spus ca l folosim doar ca punct de plecare 
        }
        else {
            linie.setAttribute('points', `${tempX},${tempY} ${x},${y}`);
        }
        //atasam linia la svg 
        svg.append(linie);
        tempX = x;
        tempY = y;
        //cand avem mouse ul deasupra liniei ,va fi afisat anul si valoarea acelui element deasupra svg ului 
        linie.addEventListener('mouseenter', () => {
            let textTooltip = 'An :' + `${i + 1999}` + ' Valoare :' + valoriBune[i];
            let valori = document.getElementById('valori');
            valori.innerHTML = textTooltip;
        })
        //cand mouse ul nu mai este deasupra vreunui element, nu se vor mai afisa valorile 
        linie.addEventListener('mouseleave', () => {
            let valori = document.getElementById('valori');
            valori.innerHTML = "An: Valoare: ";

        })
    }

}
function deseneazaTabel() {
    //desenam tabelul 

    let tbody = document.querySelector('#tbody');
    let tfootTr = document.querySelector("#tdTfoor");
    //in tbody vom avea valorile si in tfoot vom avea valorile medii 
    tbody.innerHTML = "";
    tfootTr.innerHTML = "";
    let casutaMedie = document.createElement('td');
    casutaMedie.innerHTML = "Media";
    tfootTr.append(casutaMedie);
    //acesta va fi vectorul cu valorile din anul selectat
    let ani = [];
    //suma** si suma**counter sunt folosite pentru a calcula media  
    let sumaSV = 0;
    let sumaPOP = 0;
    let sumaPIB = 0;
    let sumaSVcounter = 0;
    let sumaPOPcounter = 0;
    let sumaPIBcounter = 0;
    //ne populam vectorul cu valori in functie de anul din select 
    for (let i = 0; i < tari.length; i++) {
        if (tari[i].an == document.querySelector('#ani').value) {
            ani.push(tari[i]);
        }
    }
    //ne formam suma si counterul, care ne vor ajuta sa obtinem media 
    for (let i = 0; i < ani.length; i++) {
        if (ani[i].indicator == "SV") {
            if (ani[i].valoare != null) {
                sumaSV += ani[i].valoare;
                sumaSVcounter++;
            }

        }
        if (ani[i].indicator == "POP") {
            if (ani[i].valoare != null) {
                sumaPOP += ani[i].valoare;
                sumaPOPcounter++;
            }
        }
        if (ani[i].indicator == "PIB") {
            if (ani[i].valoare != null) {
                sumaPIB += ani[i].valoare;
                sumaPIBcounter++;
            }
        }
    }
    //aici se calculeaza media 
    let sumaSVMedie = Math.round(sumaSV / sumaSVcounter);
    let sumaPOPMedie = Math.round(sumaPOP / sumaPOPcounter);
    let sumaPIBMedie = Math.round(sumaPIB / sumaPIBcounter);

    //vom calcula culoarea de la verde la rosu , verde insemnand ca valoarea respectiva este foarte aproape de medie
    //rosu inseamna ca valoarea respectiva este departe de medie
    function calculCuloare(procent) {
        let r, g, b = 0;
        if (procent < 50) {
            g = 255;
            r = Math.round(5.1 * procent);
        }
        else {
            r = 255;
            g = Math.round(510 - 5.10 * procent);
        }
        return `rgb(${r}, ${g}, ${b})`
    }
    //aceeasi functie, dar speciala pentru indicatorul SV deoarece acolo,diferentele de valoare sunt foarte mici 
    function calculCuloareSV(procent) {
        let r, g, b = 0;
        if (procent < 50) {
            g = 255;
            r = Math.round(500 * procent);
        }
        else {
            r = 255;
            g = Math.round(510 - 500 * procent);
        }
        return `rgb(${r}, ${g}, ${b})`
    }

    //mai jos, ne vom forma tabelul , colorand fiecare valoare in functie de distanta fata de medie 
    for (let i = 0; i < ani.length; i++) {
        //pentru fiecare tara, vom prelua numele si valoarea fiecarui indice din anul respectiv 
        let newTr = document.createElement('tr');
        let newTdTara = document.createElement('td');
        let newTdSV = document.createElement('td');
        let newTdPOP = document.createElement('td');
        let newTdPIB = document.createElement('td');
        //numele 
        newTdTara.innerHTML = ani[i].tara;
        //sv
        for (let j = 0; j < ani.length; j++) {
            if (ani[j].indicator == "SV" && ani[j].tara == ani[i].tara) {
                newTdSV.innerHTML = ani[j].valoare;
                let valoare = ani[j].valoare;
                let procent = Math.sqrt((valoare - sumaSVMedie) * (valoare - sumaSVMedie)) * 100 / sumaSVMedie;
                newTdSV.setAttribute('style', `background-color:  ${calculCuloareSV(procent)}`);
            }
        }
        //pop
        for (let k = 0; k < ani.length; k++) {
            if (ani[k].indicator == "POP" && ani[k].tara == ani[i].tara) {
                newTdPOP.innerHTML = ani[k].valoare;
                let valoare = ani[k].valoare;
                let procent = Math.sqrt((valoare - sumaPOPMedie) * (valoare - sumaPOPMedie)) * 100 / sumaPOPMedie;

                newTdPOP.setAttribute('style', `background-color:  ${calculCuloare(procent)}`);

            }
        }
        //pib
        for (let l = 0; l < ani.length; l++) {
            if (ani[l].indicator == "PIB" && ani[l].tara == ani[i].tara) {
                newTdPIB.innerHTML = ani[l].valoare;
                let valoare = ani[l].valoare;
                let procent = Math.sqrt((valoare - sumaPIBMedie) * (valoare - sumaPIBMedie)) * 100 / sumaPIBMedie;
                newTdPIB.setAttribute('style', `background-color:  ${calculCuloare(procent)}`);
            }
        }
        //atasam valorile  tabelului 
        newTr.append(newTdTara);
        newTr.append(newTdSV);
        newTr.append(newTdPOP);
        newTr.append(newTdPIB);
        tbody.append(newTr);
    }

    let tdMedieSV = document.createElement('td');
    let tdMediePOP = document.createElement('td');
    let tdMediePIB = document.createElement('td');
    //in footer ul tabelului, vom atasa valorile medii 
    tdMedieSV.innerHTML = sumaSVMedie;
    tdMediePOP.innerHTML = sumaPOPMedie;
    tdMediePIB.innerHTML = sumaPIBMedie;
    tfootTr.append(tdMedieSV);
    tfootTr.append(tdMediePOP);
    tfootTr.append(tdMediePIB);
}
document.addEventListener('DOMContentLoaded', aplicatie); 