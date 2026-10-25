# Sottotitoli in inglese per la predicazione

Sistema per mostrare sul telefono dei partecipanti al culto la traduzione inglese del sermone, con il paragrafo in corso evidenziato e lo scorrimento automatico. Un volontario in prima fila fa avanzare il testo dalla pagina di regia.

## I file

| File | A cosa serve |
|---|---|
| `index.html` | Pagina per i fedeli (in inglese). È quella che apre il QR code. |
| `regia.html` | Telecomando per il volontario: testo italiano, tocco sul paragrafo o pulsanti Avanti/Indietro. Serve l'accesso con Google. |
| `backend.js` | Collegamento con Firebase (o modalità demo). Non va modificato. |
| `config.js` | **Da compilare** con i dati del tuo progetto Firebase. |
| `database.rules.json` | Regole di sicurezza da incollare in Firebase. |
| `sermoni/2026-10-25.json` | Sermone di prova (Mt 22,34-46) con la traduzione allineata. |
| `qr-culto.png` | QR code per il bollettino, punta a `https://bob0b0.github.io/culto/`. |

---

## 1. Pubblicare le pagine su GitHub (circa 10 minuti)

1. Su github.com crea un nuovo repository chiamato **`culto`**, *Public* (GitHub Pages gratuito richiede un repository pubblico).
2. *Add file → Upload files*: trascina **tutti** i file di questa cartella, compresa la cartella `sermoni`. *Commit changes*.
3. *Settings → Pages*: in *Build and deployment* scegli *Deploy from a branch*, ramo `main`, cartella `/ (root)`, *Save*.
4. Dopo un paio di minuti le pagine sono online:
   - fedeli: `https://bob0b0.github.io/culto/`
   - regia: `https://bob0b0.github.io/culto/regia.html`

**Prova subito in modalità demo.** Finché `config.js` non è compilato, le pagine funzionano in demo: apri la regia in una scheda e la pagina dei fedeli in un'altra **dello stesso browser**. Scegli il sermone, premi *Inizia* e poi *Avanti*: nell'altra scheda il testo si evidenzia e scorre. In demo i telefoni non si collegano tra loro: per quello serve Firebase.

> Il repository è pubblico: contiene solo il programma e il sermone di prova. I sermoni veri li carichi dalla regia e restano in Firebase.

## 2. Creare il progetto Firebase (circa 15 minuti, una volta sola)

1. Vai su <https://console.firebase.google.com> con il tuo account Google → **Crea un progetto**, nome per esempio `culto-verona`. Google Analytics: puoi disattivarlo.
2. Menu *Build → Realtime Database → Crea database*. Posizione: **Belgio (europe-west1)**. Modalità: **bloccata** (le regole le mettiamo al punto 6).
3. Menu *Build → Authentication → Inizia*. In *Metodo di accesso* attiva **Google** e scegli la tua email come email di assistenza.
4. Sempre in *Authentication → Impostazioni → Domini autorizzati* → **Aggiungi dominio**: `bob0b0.github.io`
5. Ingranaggio in alto a sinistra → *Impostazioni progetto* → in fondo *Le tue app* → icona **`</>`** (Web). Nome `culto`, **non** spuntare Firebase Hosting. Firebase mostra un blocco `firebaseConfig`: copia i valori `apiKey`, `authDomain`, `databaseURL`, `projectId`, `appId` dentro `config.js` al posto degli `INSERISCI…`.
   - Se `databaseURL` non compare, lo trovi in cima alla pagina *Realtime Database* (inizia con `https://` e finisce con `firebasedatabase.app`).
   - L'`apiKey` di Firebase non è una password: è normale che stia in una pagina pubblica. La protezione la fanno le regole del punto 6.
6. *Realtime Database → Regole*: cancella tutto, incolla il contenuto di `database.rules.json` e sostituisci **`EMAIL_REGIA_1`** con il tuo Gmail e **`EMAIL_REGIA_2`** con quello del volontario (se non c'è ancora, ripeti il tuo). → **Pubblica**.
   Così chiunque può *leggere* i sottotitoli, ma solo voi due potete guidarli o caricare sermoni.
7. Su GitHub apri `config.js` → icona matita → incolla la versione compilata → *Commit*. Dopo un minuto la modalità demo sparisce.

## 3. Prova vera, con due dispositivi

1. Sul PC o sull'iPad apri la **regia** → *Accedi con Google*.
2. *Gestione sermoni* → scegli il file `sermoni/2026-10-25.json` → *Salva sermone*.
3. Sul telefono inquadra il QR code (o apri `https://bob0b0.github.io/culto/`).
4. In regia scegli il sermone nel menu: sul telefono compare il testo con l'avviso *Starting soon*.
5. *Inizia* e poi *Avanti*: il telefono segue.

## 4. Ogni domenica

1. **Prima:** mandami il sermone (come oggi). Ti restituisco il file `.json` con la traduzione allineata paragrafo per paragrafo. Rivedila: la traduzione la controlli tu.
2. **Prima del culto:** in regia → *Gestione sermoni* → carica il file → sceglilo nel menu in alto. Da quel momento chi apre il QR vede il testo e l'avviso che si inizierà a breve.
3. **Durante la predicazione:** il volontario preme *Avanti* **quando inizi** un paragrafo, non quando lo finisci. Se salti o torni indietro, basta toccare il paragrafo giusto.
4. **Alla fine:** *Termina*. Il testo resta leggibile sui telefoni.

### Consigli per il volontario
- Sull'iPad o sul PC funzionano anche le frecce della tastiera, la barra spaziatrice e i tasti PagSu/PagGiù. Un **voltapagine Bluetooth** (quelli per spartiti) permette di avanzare con un pedale o un clicker senza guardare lo schermo.
- Il pulsante **EN** in alto mostra anche la traduzione, utile per controllare.
- Se la connessione cade, i telefoni mostrano *Reconnecting…* e si riallineano da soli appena torna la rete.

### Cosa vedono i fedeli
- Testo in inglese a caratteri grandi, tema scuro (per non illuminare la sala), schermo che resta acceso.
- Il paragrafo in corso è evidenziato e centrato; quelli già detti si attenuano.
- Si può scorrere indietro per rileggere: compare il pulsante *Back to the live passage*.
- **A− / A+** cambiano la dimensione del testo, **IT** mostra anche l'originale italiano, **☀/☾** passa da scuro a chiaro.

## Costi

Zero. GitHub Pages è gratuito; il piano gratuito di Firebase (Spark) copre ampiamente un culto settimanale: viaggiano solo pochi kilobyte di testo per ogni telefono. L'unico limite da tenere presente è il numero di telefoni collegati contemporaneamente, che nel piano gratuito arriva a circa 100: più che sufficiente per un culto.
