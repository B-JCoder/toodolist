// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
    // Get references to the necessary DOM elements
    const form = document.getElementById('todo-form');  // Form to add new tasks
    const input = document.getElementById('todo-input'); // Input field for task text
    const searchForm = document.getElementById('search-form'); // Form to search tasks
    const searchInput = document.getElementById('search-input'); // Input field for search text
    const errorMessage = document.getElementById('error-message'); // Element to display error messages
    const taskLists = {
        tasks: document.getElementById('task-list'), // UL element for 'Tasks' section
        'in-progress': document.getElementById('in-progress-list'), // UL element for 'In Progress' section
        completed: document.getElementById('completed-list') // UL element for 'Completed' section
    };

    // Hide the preloader once the page has fully loaded
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        preloader.style.display = 'none';
    });

    // Handle the form submission for adding new tasks
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the form from refreshing the page
        const taskText = input.value.trim(); // Get and trim the input value
        if (taskText && !isDuplicateTask(taskText)) { // Check if the task is not a duplicate
            addTask(taskText, 'tasks'); // Add the task to the 'Tasks' section
            input.value = ''; // Clear the input field
            errorMessage.textContent = ''; // Clear any previous error messages
        } else {
            errorMessage.textContent = 'This task is already added.'; // Show error message if duplicate
        }
    });

    // Function to check if a task is already present in any list
    function isDuplicateTask(text) {
        return Object.values(taskLists).some(list => 
            Array.from(list.children).some(item => item.textContent.includes(text))
        );
    }

    // Function to create and add a new task to a specified list
    function addTask(text, status) {
        const li = document.createElement('li'); // Create a new list item
        li.textContent = text; // Set the text of the list item
        li.draggable = true; // Make the item draggable
        li.classList.add('task-item'); // Add a class for styling

        // Create and add a delete button to the list item
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'status-btn delete-btn';
        deleteBtn.addEventListener('click', () => {
            li.remove(); // Remove the list item when the button is clicked
        });

        li.appendChild(deleteBtn); // Append the delete button to the list item
        taskLists[status].appendChild(li); // Add the list item to the specified list

        // Event listener for drag start
        li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', text); // Set the task text in data transfer
            e.dataTransfer.setData('text/status', status); // Set the original status in data transfer
            li.classList.add('dragging'); // Add class for styling during drag
        });

        // Event listener for drag end
        li.addEventListener('dragend', () => {
            li.classList.remove('dragging'); // Remove the dragging class
            Object.values(taskLists).forEach(list => {
                list.classList.remove('droppable-hover', 'droppable-in-progress-hover', 'droppable-completed-hover'); // Remove hover effects
            });
        });

        // Set color based on the status of the task
        if (status === 'in-progress') {
            li.classList.add('in-progress');
        } else if (status === 'completed') {
            li.classList.add('completed');
        }
    }

    // Add drag and drop event listeners to each task list
    Object.values(taskLists).forEach(list => {
        list.addEventListener('dragover', (e) => {
            e.preventDefault(); // Prevent the default behavior to allow dropping
            // Add hover effect based on the list's status
            if (list.dataset.status === 'in-progress') {
                list.classList.add('droppable-in-progress-hover');
            } else if (list.dataset.status === 'completed') {
                list.classList.add('droppable-completed-hover');
            } else {
                list.classList.add('droppable-hover');
            }
        });

        list.addEventListener('dragleave', () => {
            list.classList.remove('droppable-hover', 'droppable-in-progress-hover', 'droppable-completed-hover'); // Remove hover effects
        });

        list.addEventListener('drop', (e) => {
            e.preventDefault(); // Prevent the default behavior
            const taskText = e.dataTransfer.getData('text/plain'); // Get the task text from data transfer
            const sourceStatus = e.dataTransfer.getData('text/status'); // Get the original status from data transfer
            if (sourceStatus !== list.dataset.status) { // Only handle drop if the status is different
                addTask(taskText, list.dataset.status); // Add the task to the new list
                // Remove the task from the original list
                Array.from(taskLists[sourceStatus].children).forEach(item => {
                    if (item.textContent.includes(taskText)) {
                        item.remove();
                    }
                });
            }
            list.classList.remove('droppable-hover', 'droppable-in-progress-hover', 'droppable-completed-hover'); // Remove hover effects
        });
    });

    // Handle the search form submission and input changes
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent form submission from refreshing the page
        const query = searchInput.value.toLowerCase(); // Get and lower case the search query
        searchTasks(query); // Call function to search tasks
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase(); // Get and lower case the search query
        searchTasks(query); // Call function to search tasks
    });

    // Function to search and filter tasks based on query
    function searchTasks(query) {
        Object.values(taskLists).forEach(list => {
            Array.from(list.children).forEach(item => {
                if (item.textContent.toLowerCase().includes(query)) {
                    item.style.display = ''; // Show items that match the query
                } else {
                    item.style.display = 'none'; // Hide items that do not match the query
                }
            });
        });
    }
});
