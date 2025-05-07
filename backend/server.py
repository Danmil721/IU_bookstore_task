from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  

# source to books.json-file
BOOKS_FILE = os.path.join(os.path.dirname(__file__), '../Task_5/books.json')



# Helper function: Reads JSON file
# - Opens file in read mode ('r')
# - 'with' ensures automatic file closure after reading
# - 'as f' assigns the file object to variable 'f'
# - json.load(f) converts JSON content into a Python object (list/dict)
# Returns book list for use by other code components (e.g., API endpoints)
def read_books():
    with open(BOOKS_FILE, 'r') as f:
        return json.load(f)

# writes JSON data
def write_books(books):
    with open(BOOKS_FILE, 'w') as f:
        json.dump(books, f, indent=2)

# retrieve all books
@app.route('/books', methods=['GET'])
def get_books():
    try:
        books = read_books()
        return jsonify(books)
    except Exception as e:
        return jsonify({'error': 'failed to read books'}), 500

# add a new book
@app.route('/books', methods=['POST'])
def add_book():
    try:
        books = read_books()
        new_book = request.get_json()
        books.append(new_book)
        write_books(books)
        return jsonify(new_book), 201
    except Exception as e:
        return jsonify({'error': 'failed to add a book'}), 500

# update books based on title
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
        return jsonify({'error': 'book not found'}), 404
    except Exception as e:
        return jsonify({'error': 'failed to update the book'}), 500

# delete book
@app.route('/books/<title>', methods=['DELETE'])
def delete_book(title):
    try:
        books = read_books()
        for i, book in enumerate(books):
            if book['title'] == title:
                books.pop(i)
                write_books(books)
                return jsonify({'message': 'book deleted'})
        return jsonify({'error': 'book not found'}), 404
    except Exception as e:
        return jsonify({'error': 'failed to delete book'}), 500

if __name__ == '__main__':
    app.run(port=3000, debug=True)