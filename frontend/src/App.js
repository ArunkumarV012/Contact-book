import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/contacts';
const ITEMS_PER_PAGE = 10;

function App() {
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchContacts();
  }, [currentPage]); 

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL, {
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE
        }
      });
      setContacts(response.data.contacts);
      setTotalContacts(response.data.total);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required.';
    if (!formData.email) {
      errors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid.';
    }
    if (!formData.phone) {
      errors.phone = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone number must be 10 digits.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post(API_URL, formData);
      setFormData({ name: '', email: '', phone: '' }); 
      fetchContacts(); 
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to add contact.';
      setFormErrors({ ...formErrors, api: errorMessage });
      console.error('Error adding contact:', error);
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      
      setContacts(contacts.filter(contact => contact.id !== id));
      
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const totalPages = Math.ceil(totalContacts / ITEMS_PER_PAGE);

  return (
    <div className="container">
      <header>
        <h1>Contact Book</h1>
      </header>

      {/* Add Contact Form */}
      <section className="form-section">
        <h2>Add a New Contact</h2>
        <form onSubmit={handleAddContact}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            {formErrors.name && <p className="error">{formErrors.name}</p>}
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            {formErrors.email && <p className="error">{formErrors.email}</p>}
          </div>
          <div className="form-group">
            <label>Phone:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
            {formErrors.phone && <p className="error">{formErrors.phone}</p>}
          </div>
          {formErrors.api && <p className="error api-error">{formErrors.api}</p>}
          <button type="submit">Add Contact</button>
        </form>
      </section>

      <section className="contact-list-section">
        <h2>My Contacts</h2>
        {isLoading ? (
          <p>Loading contacts...</p>
        ) : contacts.length > 0 ? (
          <>
            <ul className="contact-list">
              {contacts.map(contact => (
                <li key={contact.id} className="contact-item">
                  <div>
                    <strong>{contact.name}</strong>
                    <p>Email: {contact.email}</p>
                    <p>Phone: {contact.phone}</p>
                  </div>
                  <button className="delete-btn" onClick={() => handleDeleteContact(contact.id)}>Delete</button>
                </li>
              ))}
            </ul>
            
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p>No contacts to display.</p>
        )}
      </section>
    </div>
  );
}

export default App;
