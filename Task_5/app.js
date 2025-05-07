    //importing defined and needed functions and objects from the global Vue Variable
const { createApp, ref, reactive, onMounted } = Vue;

    // Creating a new Vue application
createApp({
    // setup() defines the logic of the Vue application with its data and methods and returns 
    // later the propertys which are available in HTML template
    setup() {
    // defining reactive variables
    // books is a reactive reference, which stores the reactive value of the array, which is the book list.
    // Therefore, updates in books.value will be automatically represented in the HTML table. 
    const books = ref([]);
    // form is a reactive object. It saves the user inputs. It is connected with the input fields in
    // html template through v-model. If the user types something into the input field,
    // Vue will automatically send in to the const form. 
    const form = reactive({
      title: '',
      author: '',
      year: '',
      genre: ''
    });
    // editingIndex saves the index of the current book in the books-array (in the editBook function)
    // it also controls the mode of the heading in the form: if it is null, the form is in add mode, 
    // if it is not null, the form is in edit mode (heading).
    const editingIndex = ref(null);
    // errors is a reactive object, which will be used to store error messages.
    const errors = reactive({
      title: '',
      author: '',
      year: '',
      genre: ''
    });

    // API-URL
    const API_URL = 'http://localhost:3000/books';

    // load books
    const loadBooks = async () => {
      try {
        // response sends a get request to the localhost server. fetch gives back a response, which
        //contains a response object with status and data.
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Loading failed');
        // response.json() converts the obtained JSON body from fetch into a Java-Script object, such as an array of books.
        // the result of the conversion will be saved in books.value
        books.value = await response.json();
      } catch (error) {
        console.error("Loading failed:", error);
      }
    };

    // As the Website is rendered in the browser, the loadBooks function will be invoked.
    onMounted(loadBooks);

    // ensure that there is no empty input
    const validateForm = () => {
      let isValid = true;
      // ensuring that the error message is empty at the beginning of the function. 
      // accessing the error objects keys and set them back to an empty string.
      Object.keys(errors).forEach(key => errors[key] = '');
      
      if (!form.title.trim()) {
        errors.title = 'Title is necessary';
        isValid = false;
      }
      
      if (!form.author.trim()) {
        errors.author = 'Author is necessary';
        isValid = false;
      }
      
      if (!form.year) {
        errors.year = 'Year is necessary';
        isValid = false;
        // ensuring the input is a number and greater 0.
      } else if (isNaN(form.year) || form.year < 0) {
        errors.year = 'Unvalid year';
        isValid = false;
      }
      
      if (!form.genre.trim()) {
        errors.genre = 'Genre is necessary';
        isValid = false;
      }
      
      return isValid;
    };

    // book operations
    const submitBook = async () => {
      if (!validateForm()) return;
      
        // book will hold the user input which is hold in reactive form object.
      const book = {
        title: form.title,
        author: form.author,
        year: parseInt(form.year),
        genre: form.genre
      };
      
      try {
        if (editingIndex.value === null) {
          // add a new book
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Convert book object to JSON string for HTTP transmission
            // (Required because fetch() cannot send raw JavaScript objects)
            body: JSON.stringify(book)
          });
          if (!response.ok) throw new Error('Adding failed');
        } else {
            // Update existing book: 
            // The book title serves as the unique identifier. We retrieve the original title
            // from the books array using the stored editingIndex (set during editBook()).
            // This approach ensures we target the correct book for updates.
          const originalTitle = books.value[editingIndex.value].title;
            // Send PUT request to update the identified book
          const response = await fetch(`${API_URL}/${encodeURIComponent(originalTitle)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            // convert the new book into a JSON string for HTTP transmission.
            body: JSON.stringify(book)
          });
          if (!response.ok) throw new Error('Update failed');
          editingIndex.value = null;
        }
        // refresh books
        await loadBooks();
        resetForm();
      } catch (error) {
        console.error("Failed to save:", error);
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
      if (confirm(`Do you want to delete the book "${book.title}" ?`)) {
        try {
          const response = await fetch(`${API_URL}/${encodeURIComponent(book.title)}`, {
            method: 'DELETE'
          });
          if (!response.ok) throw new Error('Failed to delete');
          await loadBooks();
        } catch (error) {
          console.error("Failed to delete:", error);
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