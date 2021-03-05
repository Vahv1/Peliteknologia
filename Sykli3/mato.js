var asetukset = {
    type: Phaser.AUTO,
    // Suhteutetaan koko näyttöön sopivaksi
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'peli-div',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 540,
        height: 960
    },
    backgroundColor: '#87CEFA',
    scene: {
        preload: lataa,
        create: luo,
        update: paivita
    }
};

// Tarvittavat peliobjektit + näppäimet
var mato;
var omena;
var ohjaimet;

// Madon suunnat vakiomuuttujina
const YLOS = 0;
const ALAS = 1;
const VASEN = 2;
const OIKEA = 3;

var maxNopeus = 90; // Tätä nopeempaa ei mato kulje
var ruudunKoko = 20; // Mato liikuu ruuduittain eli ruudun koon välein
var kentanLeveys = 540 / 20; // Kuinka monta ruutua leveä kenttä on
var kentanKorkeus = 960 / 20 // Kuinka monta ruutua korkea kenttä on

var peli = new Phaser.Game(asetukset);

// Ladataan kuvat ja äänet käyttöä varten
function lataa ()
{
    this.load.image('omena', 'assetit/omppu.png');
    this.load.image('mato', 'assetit/mato.png');
    
    this.load.audio('tormays', 'assetit/wat.ogg');
    this.load.audio('syonti', 'assetit/nam.mp3');
    this.load.audio('kaanto', 'assetit/viuh.wav');
}

// Luodaan luokat madolle ja omenalle ja asetetaan ne pelimaailmaan
function luo ()
{
    // Lisätään äänet
    this.sound.add('tormays');
    this.sound.add('syonti');
    this.sound.add('kaanto');
    
    // Omena, joita madolla syödään
    var Omena = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize: function Omena (skene, x, y)
        {
            Phaser.GameObjects.Image.call(this, skene)

            this.setTexture('omena');
            this.setPosition(x * ruudunKoko, y * ruudunKoko); // Asetetaan omena pikselisijaintiin ruudukkosijainnista
            this.setOrigin(0); //Asetetaan tekstuurin vasen yläkulma haluttuun koordinaattiin
            this.syodyt = 0; // Tallennetaan syötyjen omenoiden määrä, ei itse asiassa ees käytetä mihinkään tässä

            skene.children.add(this);
        },
        
        // Lisätään syötyjä omenoita
        eat: function ()
        {
            this.syodyt++;
        }

    });

    var Mato = new Phaser.Class({

        initialize: function Mato (skene, x, y)
        {
            // Muuttujat hännän ja pään sijainnille (pelissä ei oo ketään Hannaa)
            this.paanSijainti = new Phaser.Geom.Point(x, y);
            this.hannanSijainti = new Phaser.Geom.Point(x, y);
            // Tehdään ryhmä, johon lisätään madon palaset niiden helpompaa käsittelyä varten
            this.madonOsat = skene.add.group(); 
            // Luodaan madolle pää ja asetetaan se oikeaan paikkaan
            this.paa = this.madonOsat.create(x * ruudunKoko, y * ruudunKoko, 'mato');
            this.paa.setOrigin(0);
            // Asetetaan mato eläväksi ja annetaan sille nopeus
            this.elossa = true;
            this.nopeus = 1;
            // Muuttuja, joka pitää huolta milloin madon kuuluu liikkua näytöllä
            this.seuraavaLiikeAika = 0;
            // Madon nykyinen suunta sekä uusi suunta, jota muutetaan matoa käännettäessä
            this.suunta = OIKEA;
            this.uusiSuunta = OIKEA;
        },
        
        // Liikutetaan matoa, jos viime liikkeestä on kulunut vaadittu aika
        paivita: function (skene, aika)
        {
            if (aika >= this.seuraavaLiikeAika)
            {
                return this.liiku(skene, aika);
            }
        },

        // Funktiot madon kääntämiseen
        // 180 asteen käännös on estetty tarkistamalla suunta ennen uuden suunnan asettamista
        kaannyVasen: function (skene)
        {
            if (this.suunta === YLOS || this.suunta === ALAS)
            {
                this.uusiSuunta = VASEN;
            }
        },

        kaannyOikea: function (skene)
        {
            if (this.suunta === YLOS || this.suunta === ALAS)
            {
                this.uusiSuunta = OIKEA;
            }
        },

        kaannyYlos: function (skene)
        {
            if (this.suunta === VASEN || this.suunta === OIKEA)
            {
                this.uusiSuunta = YLOS;
            }
        },

        kaannyAlas: function (skene)
        {
            if (this.suunta === VASEN || this.suunta === OIKEA)
            {
                this.uusiSuunta = ALAS;
            }
        },

        // Madon liikutus
        liiku: function (skene, aika)
        {
            // Liikuttaa madon päätä yhden ruudun verran liikkumissuuntaan
            // Jos pää menee yli kentän rajoista, asetetaan se toiselle puolelle kenttää
            // Mato siis kulkee seinien lävitse
            switch (this.uusiSuunta)
            {
                case VASEN:
                    this.paanSijainti.x = Phaser.Math.Wrap(this.paanSijainti.x - 1, 0, kentanLeveys);
                    break;

                case OIKEA:
                    this.paanSijainti.x = Phaser.Math.Wrap(this.paanSijainti.x + 1, 0, kentanLeveys);
                    break;

                case YLOS:
                    this.paanSijainti.y = Phaser.Math.Wrap(this.paanSijainti.y - 1, 0, kentanKorkeus);
                    break;

                case ALAS:
                    this.paanSijainti.y = Phaser.Math.Wrap(this.paanSijainti.y + 1, 0, kentanKorkeus);
                    break;
            }
            
            // Soitetaan kääntöääni ja tallennetaan suunta jos sitä vaihdettiin
            if (this.suunta != this.uusiSuunta)
            {
                skene.sound.play('kaanto');
                this.suunta = this.uusiSuunta;
            } 

            // Liikutetaan madon osia pään mukana ja tallennetaan viimeisimmän osan sijanti hannanSijaintiin
            Phaser.Actions.ShiftPosition(this.madonOsat.getChildren(), this.paanSijainti.x * ruudunKoko, this.paanSijainti.y * ruudunKoko, 1, this.hannanSijainti);

            // Tarkistetaan onko pään sijainti sama kuin jollain muulla madon osalla, siis törmäsikö mato itseensä
            if (Phaser.Actions.GetFirst(this.madonOsat.getChildren(), { x: this.paa.x, y: this.paa.y }, 1))
            {
                this.elossa = false;
                skene.sound.play('tormays', {volume: 0.3});
                return false;
            }
            else
            {
                // Asetetaan aika seuraavalle liikkeelle madon nopeuden mukaan
                this.seuraavaLiikeAika = aika + (100 - this.nopeus);
                return true;
            }
        },

        // Madon kasvattaminen
        kasvataMatoa: function ()
        {
            // Luodaan uusi osa madolle sen hännän sijaintiin
            var uusiOsa = this.madonOsat.create(this.hannanSijainti.x, this.hannanSijainti.y, 'mato');
            uusiOsa.setOrigin(0);
            // Kasvatetaan madon nopeutta jos se ei ole vielä maksimissa
            if (this.nopeus < maxNopeus)
            {
                this.nopeus += 2;
            }
        },

        // Omenaan osuminen
        osuiOmenaan: function (skene, omena)
        {
            // Tarkistetaan osuuko madon pää omenaan
            if (this.paa.x === omena.x && this.paa.y === omena.y)
            {
                // Jos osuu, kasvatetaan matoa ja liikutetaan omena uuteen paikkaan
                this.kasvataMatoa();
                omena.eat
                skene.sound.play('syonti');
                return true;
            }
            else
            {
                return false;
            }
        },
        
        // Päivitetään pelikentän ruudukko 
        paivitaRuudukko: function (ruudukko)
        {
            // Käydään läpi jokaisen madon osan sijainti
            this.madonOsat.children.each(function (segment) {

                var x = segment.x / ruudunKoko;
                var y = segment.y / ruudunKoko;
                
                // Asetetaan sijainnin arvo ruudukossa falseksi, siis ruutu on täynnä
                ruudukko[x][y] = false;

            });
            return ruudukko;
        }

    });

    // Luodaan objektit pelikentälle ja näppäimet peliin
    omena = new Omena(this, 0, 0);
    mato = new Mato(this, 13, 23);
    ohjaimet = this.input.keyboard.createCursorKeys();
    // Asetetaan ekakin omena randompaikkaan
    liikutaOmena();
}

function paivita (time, delta)
{
    // Jos mato on kuollut lopetetaan ruudun päviitys eli pysäytetään peli
    if (!mato.elossa)
    {
        return;
    }
    
    // Käännetään matoa painettua näppäintä vastaavaan suuntaan
    if (ohjaimet.left.isDown)
    {
        mato.kaannyVasen(this);
    }
    else if (ohjaimet.right.isDown)
    {
        mato.kaannyOikea(this);
    }
    else if (ohjaimet.up.isDown)
    {
        mato.kaannyYlos(this);
    }
    else if (ohjaimet.down.isDown)
    {
        mato.kaannyAlas(this);
    }
    
    // Päivitetään mato eli liikutetaan sitä
    if (mato.paivita(this, time))
    {
        // Tarkastetaan osuiko mato omenaan, jos osui, siirretään omena uuteen sijaintiin
        if (mato.osuiOmenaan(this, omena))
        {
            liikutaOmena();
        }
    }
}

// Asettaa omenan uuteen sijaintiin
function liikutaOmena ()
{
    // Tehdään taulukko joka sisältää kaikki kentän ruudut arvolla true
    var kenttaRuudukko = [];
    for (var y = 0; y < kentanKorkeus; y++)
    {
        kenttaRuudukko[y] = [];

        for (var x = 0; x < kentanLeveys; x++)
        {
            kenttaRuudukko[y][x] = true;
        }
    }
    
    // Päivitetään ruudukko madon kautta, eli asetetaan sen täyttämät ruudut arvoon false
    mato.paivitaRuudukko(kenttaRuudukko);

    // Tehdään uusi taulukko, johon tallennetaan vain tyhjät ruudut aiemmasta taulukosta
    var tyhjatRuudut = [];
    for (var y = 0; y < kentanKorkeus; y++)
    {
        for (var x = 0; x < kentanLeveys; x++)
        {
            if (kenttaRuudukko[y][x] === true)
            {
                tyhjatRuudut.push({ x: x, y: y });
            }
        }
    }

    if (tyhjatRuudut.length > 0)
    {
        // Arvotaan tyhjistä ruuduista omenalle uusi sijainti ja siirretään se sinne
        var uusiSijainti = Phaser.Math.RND.pick(tyhjatRuudut);
        console.log(tyhjatRuudut);
        omena.setPosition(uusiSijainti.x * ruudunKoko, uusiSijainti.y * ruudunKoko);
        return true;
    }
    else
    {
        return false;
    }
}
