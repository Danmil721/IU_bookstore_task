from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Erlaubt Cross-Origin-Anfragen

# Pfad zur books.json-Datei
BOOKS_FILE = os.path.join(os.path.dirname(__file__), '../Task_5/books.json')



# Hilfsfunktion: JSON-Datei lesen. öffnet im Lesemodus (r=read). open = öffnen und 
# with stellt sicher, dass die datei nach dem lesen wieder geschlossen wird.
# as f: Gibt der geöffneten Datei den Namen f (eine Variable, die die Datei repräsentiert).
# return json.load(f) :Liest den Inhalt von books.json und wandelt ihn von JSON
#  in ein Python-Objekt um. json.load(f) macht daraus eine Python-Liste:
# Gibt die Liste der Bücher zurück, die andere Teile des Codes (z. B. Endpunkte) verwenden können.
def read_books():
    with open(BOOKS_FILE, 'r') as f:
        return json.load(f)

# Hilfsfunktion: JSON-Datei schreiben. 
def write_books(books):
    with open(BOOKS_FILE, 'w') as f:
        json.dump(books, f, indent=2)

# Alle Bücher abrufen
@app.route('/books', methods=['GET'])
def get_books():
    try:
        books = read_books()
        return jsonify(books)
    except Exception as e:
        return jsonify({'error': 'Fehler beim Lesen der Bücher'}), 500

# Neues Buch hinzufügen
@app.route('/books', methods=['POST'])
def add_book():
    try:
        books = read_books()
        new_book = request.get_json()
        books.append(new_book)
        write_books(books)
        return jsonify(new_book), 201
    except Exception as e:
        return jsonify({'error': 'Fehler beim Hinzufügen des Buchs'}), 500

# Buch aktualisieren (nach Titel)
@app.route('/books/<title>', methods=['PUT'])
def update_book(title):
    try:
        books = read_books()
        updated_book = request.get_json()
        for i, book in enumerate(books):
            if book['title'] == title:
                books[i] = updated_book
                write_books(books)
                return jsonify(updated_book)
        return jsonify({'error': 'Buch nicht gefunden'}), 404
    except Exception as e:
        return jsonify({'error': 'Fehler beim Aktualisieren des Buchs'}), 500

# Buch löschen (nach Titel)
@app.route('/books/<title>', methods=['DELETE'])
def delete_book(title):
    try:
        books = read_books()
        for i, book in enumerate(books):
            if book['title'] == title:
                books.pop(i)
                write_books(books)
                return jsonify({'message': 'Buch gelöscht'})
        return jsonify({'error': 'Buch nicht gefunden'}), 404
    except Exception as e:
        return jsonify({'error': 'Fehler beim Löschen des Buchs'}), 500

if __name__ == '__main__':
    app.run(port=3000, debug=True)