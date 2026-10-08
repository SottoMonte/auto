# STRADA Auto

Sito statico in italiano per presentare auto in vendita e a noleggio. Le schede e i contatti sono file JSON nel repository GitHub; Decap CMS li modifica senza database o server applicativo.

## Avvio locale

Dalla cartella del progetto avvia un server statico:

```bash
python3 -m http.server 4173
```

Apri `http://localhost:4173`. La pagina `/admin` va collegata a Decap Turbo prima di consentire modifiche online.

## Pubblicazione

1. Crea un repository GitHub sul branch `main` e carica il progetto.
2. Su Netlify importa quel repository. Lascia vuoto il comando di build e imposta la cartella di pubblicazione su `.`; aggiungi poi il dominio personalizzato.
3. Crea l'organizzazione Decap Turbo con l'account del cliente. Il piano Free include un sito e un utente, quindi l'account cliente deve essere il proprietario. Collega GitHub, installa l'app Turbo sul repository e crea un sito con branch `main`, percorso di configurazione `admin/config.yml` e URL admin `https://IL-TUO-SITO/admin/`.
4. Copia la Site ID mostrata da Turbo in `admin/config.yml`, al posto di `SOSTITUISCI-CON-LA-SITE-ID-DECAP-TURBO`, e invia la modifica a GitHub. Netlify pubblicherà la configurazione aggiornata.
5. Accedi da `https://IL-TUO-SITO/admin/` con Decap Turbo. Da lì il cliente può cambiare contatti e auto; ogni salvataggio aggiorna il JSON su GitHub e avvia una nuova pubblicazione.

Il CMS usa il backend GitHub di Decap Turbo, distribuito al momento come release beta: lo script in `admin/index.html` è fissato alla versione indicata nella documentazione. Il piano Turbo Free attuale include un sito e un utente; altri utenti o siti richiedono un piano superiore. Mantieni aggiornato in Turbo l'URL admin anche dopo aver collegato il dominio definitivo.

## Dati e contatti

- `data/vehicles.json`: elenco auto, prezzi e disponibilità. Il prezzo è totale per la vendita e giornaliero per il noleggio.
- `data/site.json`: nome attività, zona e recapiti. I valori iniziali sono dimostrativi: sostituisci nome, zona ed email prima della pubblicazione. Il telefono e WhatsApp sono facoltativi.
- Le foto iniziali sono immagini dimostrative da Unsplash. Caricando le foto definitive da Decap, i file vengono salvati in `uploads/` nel repository.

Il sito raccoglie richieste tramite email o WhatsApp, ma non effettua prenotazioni, pagamenti o verifiche automatiche di disponibilità.

## Costi e limiti

Netlify Free costa attualmente €0 e include un limite di 300 crediti al mese. Le pubblicazioni di produzione e il traffico consumano crediti: oltre la quota il servizio può fermarsi fino al rinnovo o richiedere un piano superiore. Controlla i consumi e non attivare ricariche automatiche se l'obiettivo è non superare il budget. Il costo del dominio resta separato. Le quote e i piani dei servizi possono cambiare.

Per un sito commerciale non usare il piano Vercel Hobby: i termini attuali lo limitano a progetti personali o non commerciali.