const { createApp, ref, reactive, onMounted } = Vue;

createApp({
  setup() {
    // Reaktive Variablen
    const books = ref([]);
    const form = reactive({
      title: '',
      author: '',
      year: '',
      genre: ''
    });
    const editingIndex = ref(null);
    const errors = reactive({
      title: '',
      author: '',
      year: '',
      genre: ''
    });

    // API-URL
    const API_URL = 'http://localhost:3000/books';

    // Bücher laden
    const loadBooks = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Fehler beim Laden der Bücher');
        books.value = await response.json();
      } catch (error) {
        console.error("Fehler beim Laden der Bücher:", error);
      }
    };

    // Beim Start laden
    onMounted(loadBooks);

    // Validierungsfunktion
    const validateForm = () => {
      let isValid = true;
      Object.keys(errors).forEach(key => errors[key] = '');
      
      if (!form.title.trim()) {
        errors.title = 'Titel ist erforderlich';
        isValid = false;
      }
      
      if (!form.author.trim()) {
        errors.author = 'Autor ist erforderlich';
        isValid = false;
      }
      
      if (!form.year) {
        errors.year = 'Jahr ist erforderlich';
        isValid = false;
      } else if (isNaN(form.year) || form.year < 0) {
        errors.year = 'Ungültiges Jahr';
        isValid = false;
      }
      
      if (!form.genre.trim()) {
        errors.genre = 'Genre ist erforderlich';
        isValid = false;
      }
      
      return isValid;
    };

    // Buchoperationen
    const submitBook = async () => {
      if (!validateForm()) return;
      
      const book = {
        title: form.title,
        author: form.author,
        year: parseInt(form.year),
        genre: form.genre
      };
      
      try {
        if (editingIndex.value === null) {
          // Neues Buch hinzufügen
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book)
          });
          if (!response.ok) throw new Error('Fehler beim Hinzufügen');
        } else {
          // Buch aktualisieren
          const originalTitle = books.value[editingIndex.value].title;
          const response = await fetch(`${API_URL}/${encodeURIComponent(originalTitle)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book)
          });
          if (!response.ok) throw new Error('Fehler beim Aktualisieren');
          editingIndex.value = null;
        }
        // Bücher neu laden
        await loadBooks();
        resetForm();
      } catch (error) {
        console.error("Fehler beim Speichern:", error);
      }
    };

    const editBook = (index) => {
      const book = books.value[index];
      form.title = book.title;
      form.author = book.author;
      form.year = book.year;
      form.genre = book.genre;
      editingIndex.value = index;
    };

    const deleteBook = async (index) => {
      const book = books.value[index];
      if (confirm(`Möchten Sie das Buch "${book.title}" wirklich löschen?`)) {
        try {
          const response = await fetch(`${API_URL}/${encodeURIComponent(book.title)}`, {
            method: 'DELETE'
          });
          if (!response.ok) throw new Error('Fehler beim Löschen');
          await loadBooks();
        } catch (error) {
          console.error("Fehler beim Löschen:", error);
        }
      }
    };

    const cancelEdit = () => {
      editingIndex.value = null;
      resetForm();
    };

    const resetForm = () => {
      form.title = '';
      form.author = '';
      form.year = '';
      form.genre = '';
      Object.keys(errors).forEach(key => errors[key] = '');
    };

    return {
      books,
      form,
      editingIndex,
      errors,
      submitBook,
      editBook,
      deleteBook,
      cancelEdit
    };
  }
}).mount('#app');