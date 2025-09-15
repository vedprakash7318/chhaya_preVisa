import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../CSS/ReviewFormFull.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { toast, ToastContainer } from 'react-toastify';

const VerifyLeadsFull = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [finalVisaManagers, setFinalVisaManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [managersLoading, setManagersLoading] = useState(false);
  const [managersError, setManagersError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add loading state for apply button
  const [applyLoading, setApplyLoading] = useState(false);

  const { state } = useLocation();
  const navigate = useNavigate();
  const lead = state?.lead;
  const id = lead;

  useEffect(() => {
    if (id) {
      fetchOptions();
    }
  }, [id]);

  const fetchOptions = async () => {
    setOptionsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/options/optionGet/${id}`);
      setOptions(res.data.data);
    } catch (err) {
      console.error('Error fetching options:', err);
      setOptionsError('Failed to load options');
    } finally {
      setOptionsLoading(false);
    }
  };

  const fetchFinalVisaManagers = async (searchQuery = '') => {
    setManagersLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/final-visa/', {
        params: { search: searchQuery }
      });
      setFinalVisaManagers(response.data);
    } catch (err) {
      console.error('Error fetching final visa managers:', err);
      setManagersError('Failed to load visa managers');
    } finally {
      setManagersLoading(false);
    }
  };

  // Debounced search function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const debouncedSearch = debounce((searchValue) => {
    fetchFinalVisaManagers(searchValue);
  }, 300);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    if (!state) {
      navigate('/leads');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/client-form/getbyId/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, state]);

  // Handle Final Apply for Visa button click
  const handleFinalApply = () => {
    setShowModal(true);
    fetchFinalVisaManagers();
  };

  // Handle Apply button in modal
  const handleModalApply = async () => {
    if (selectedManager) {
      setApplyLoading(true); // Start loading
      try {
        const preVisaManagerId = localStorage.getItem("PreVisaManager"); // stored earlier
        const clientFormId = id; // coming from props/state
        const finalVisaManagerId = selectedManager._id;

        console.log("Selected Final Visa Manager ID:", finalVisaManagerId);
        console.log("Lead ID:", clientFormId);
        console.log("preVisaManagerId:", preVisaManagerId);

        const res = await axios.put("http://localhost:5000/api/client-form/transfer-to-finalvisa", {
          clientFormId,
          preVisaManagerId,
          finalVisaManagerId,
        });
        console.log(res);

        if (res.data.success) {
          toast.success("Transferred successfully 🎉");
          setShowModal(false);
          setSelectedManager(null);
        } else {
          toast.error(res.data.message || "Something went wrong");
        }
      } catch (err) {
        console.error("API error:", err);
        toast.error("Server error while transferring");
      } finally {
        setApplyLoading(false); // Stop loading
      }
    } else {
      alert("Please select a Final Visa Manager");
    }
  };

  // Modal footer with loading state
  const modalFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => {
          setShowModal(false);
          setSelectedManager(null);
          setSearchTerm('');
        }}
        className="p-button-text"
        disabled={applyLoading} // Disable when applying
      />
      <Button
        label={applyLoading ? "Applying..." : "Apply"}
        icon={applyLoading ? "pi pi-spinner pi-spin" : "pi pi-check"}
        onClick={handleModalApply}
        autoFocus
        disabled={!selectedManager || applyLoading}
        loading={applyLoading} // PrimeReact button loading prop
      />
    </div>
  );

  // Enhanced Options Rendering Component
  const OptionsSection = () => {
    if (optionsLoading) {
      return (
        <div className="loading-container" style={{ textAlign: 'center', padding: '2rem' }}>
          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
          <p style={{ marginTop: '1rem', color: '#666' }}>Loading options...</p>
        </div>
      );
    }

    if (optionsError) {
      return (
        <Card className="error-card" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem', color: '#dc2626', marginBottom: '0.5rem' }}></i>
            <p style={{ color: '#dc2626', margin: '0' }}>{optionsError}</p>
            <Button
              label="Retry"
              icon="pi pi-refresh"
              onClick={fetchOptions}
              className="p-button-text p-button-sm"
              style={{ marginTop: '0.5rem' }}
            />
          </div>
        </Card>
      );
    }

    if (!options || options.length === 0) {
      return (
        <Card className="empty-options-card" style={{ backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <i className="pi pi-inbox" style={{ fontSize: '3rem', color: '#64748b', marginBottom: '1rem' }}></i>
            <h5 style={{ color: '#475569', margin: '0 0 0.5rem 0' }}>No Options Available</h5>
            <p style={{ color: '#64748b', margin: '0', fontSize: '0.9rem' }}>
              No job options have been provided for this application yet.
            </p>
          </div>
        </Card>
      );
    }

    return (
      <Accordion activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        {options.map((option, index) => (
          <AccordionTab
            key={option._id}
            header={
              <div className="option-header-accordion">
                <span>
                  <Badge
                    value={`Option ${index + 1}`}
                    severity="info"
                    style={{ backgroundColor: '#3b82f6', marginRight: '10px' }}
                  />
                  {option.options?.jobTitle && `Job: ${option.options.jobTitle}`}
                  {option.options?.country && ` - ${option.options.country.countryName}`}
                  {option.options?.salary && ` - ₹${option.options.salary.toLocaleString()}`}
                </span>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {new Date(option.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            }
          >
            <Card className="option-card" style={{ border: '1px solid #e5e7eb', boxShadow: 'none' }}>
              {/* People Involved */}
              <div className="people-section" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="person-info">
                    <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      <i className="pi pi-user" style={{ marginRight: '0.5rem', color: '#6b7280' }}></i>
                      Requested By:
                    </label>
                    <div style={{
                      marginTop: '0.25rem',
                      padding: '0.5rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}>
                      <div style={{ fontWeight: '500' }}>{option.requestedBy?.name || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="person-info">
                    <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      <i className="pi pi-user-plus" style={{ marginRight: '0.5rem', color: '#6b7280' }}></i>
                      Requested To:
                    </label>
                    <div style={{
                      marginTop: '0.25rem',
                      padding: '0.5rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}>
                      <div style={{ fontWeight: '500' }}>{option.requestedTo?.name || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Message */}
              {option.requestMessage && (
                <div className="message-section" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                    <i className="pi pi-comment" style={{ marginRight: '0.5rem', color: '#6b7280' }}></i>
                    Request Message:
                  </label>
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #dbeafe',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }}>
                    {option.requestMessage}
                  </div>
                </div>
              )}

              {/* Job Details */}
              {option.options && (
                <div className="job-details-section" style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                    <i className="pi pi-briefcase" style={{ marginRight: '0.5rem', color: '#6b7280' }}></i>
                    Job Details:
                  </label>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      <div>
                        <strong style={{ color: '#065f46' }}>Job Title:</strong>
                        <div style={{ marginTop: '0.25rem' }}>{option.options.jobTitle}</div>
                      </div>

                      {option.options.salary && (
                        <div>
                          <strong style={{ color: '#065f46' }}>Salary:</strong>
                          <div style={{ marginTop: '0.25rem' }}>₹{option.options.salary.toLocaleString()}</div>
                        </div>
                      )}

                      {option.options.WorkTime && (
                        <div>
                          <strong style={{ color: '#065f46' }}>Work Time:</strong>
                          <div style={{ marginTop: '0.25rem' }}>{option.options.WorkTime}</div>
                        </div>
                      )}
                      {option.options.country && (
                        <div>
                          <strong style={{ color: '#065f46' }}>Country:</strong>
                          <div style={{ marginTop: '0.25rem' }}>{option?.options?.country?.countryName}</div>
                        </div>
                      )}

                      {option.options.serviceCharge && (
                        <div>
                          <strong style={{ color: '#065f46' }}>Service Charge:</strong>
                          <div style={{ marginTop: '0.25rem' }}>₹{option.options.serviceCharge.toLocaleString()}</div>
                        </div>
                      )}

                      {option.options.adminCharge && (
                        <div>
                          <strong style={{ color: '#065f46' }}>Admin Charge:</strong>
                          <div style={{ marginTop: '0.25rem' }}>₹{option.options.adminCharge.toLocaleString()}</div>
                        </div>
                      )}
                    </div>

                    {option.options.description && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #bbf7d0' }}>
                        <strong style={{ color: '#065f46' }}>Description:</strong>
                        <div style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>{option.options.description}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Response Message */}
              {option.responseMessage && (
                <div className="response-section">
                  <label style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                    <i className="pi pi-reply" style={{ marginRight: '0.5rem', color: '#6b7280' }}></i>
                    Response Message:
                  </label>
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }}>
                    {option.responseMessage}
                  </div>
                </div>
              )}
            </Card>
          </AccordionTab>
        ))}
      </Accordion>
    );
  };

  if (!state) return null;
  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data) return <div className="no-data">No data available</div>;

  return (
    <div className="form-container">
      <div className="form-header">
        <div className="company-info">
          <button
            className="back-button"
            style={{padding:"7px 10px", cursor:"pointer", fontWeight:"bold"}}
            onClick={() => navigate('/verify-leads')}
          >
            ← Back to Leads
          </button>
          <h2>Chhaya International Pvt. Ltd.</h2>
          <p>LIG 2 Nehru Nagar Unnao</p>
          <p>Uttar Pradesh 209801</p>
          <p>Email: chhayainternationalpvtltd@gmail.com</p>
          <p>Contact No.: 8081478427</p>
        </div>
        <div className="client-images">
          <div className="image-box">
            <label>Client Photo:</label>
            <img src={data.photo || '/placeholder-user.jpg'} alt="Client" className="client-photo" />
          </div>
          <div className="image-box">
            <label>Client Signature:</label>
            <img src={data.Sign || '/placeholder-signature.png'} alt="Signature" className="client-signature" />
          </div>
        </div>
      </div>

      <div className="form-title-section">
        <h3 className="form-title">Registration Form</h3>
        <div className="form-meta">
          <span className="form-date"><strong>Date:</strong> {new Date(data.createdAt).toLocaleDateString()}</span>
          <span className="form-reg-no"><strong>Registration No. :- </strong>{data.regNo}</span>
        </div>
      </div>

      {/* PERSONAL DETAILS */}
      <section className="form-section personal-details">
        <h4 className="section-title">
          <span className="section-bullet">•</span> Personal Details
        </h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Full Name:</label>
            <div className="form-control">{data.fullName}</div>
          </div>

          <div className="form-group">
            <label>Father's Name:</label>
            <div className="form-control">{data.fatherName}</div>
          </div>

          <div className="form-group">
            <label>Address:</label>
            <div className="form-control">{data.address}</div>
          </div>

          <div className="form-group">
            <label>State:</label>
            <div className="form-control">{data.state}</div>
          </div>

          <div className="form-group">
            <label>PIN Code:</label>
            <div className="form-control">{data.pinCode}</div>
          </div>

          <div className="form-group">
            <label>WhatsApp Number:</label>
            <div className="form-control">{data.whatsAppNo}</div>
          </div>

          <div className="form-group">
            <label>Family Number:</label>
            <div className="form-control">{data.familyContact}</div>
          </div>
          <div className="form-group">
            <label>Contact Number:</label>
            <div className="form-control">{data.contactNo}</div>
          </div>
          <div className="form-group full-width">
            <label>Email:</label>
            <div className="form-control">{data.email}</div>
          </div>
        </div>
      </section>

      {/* PASSPORT DETAILS */}
      <section className="form-section passport-details">
        <h4 className="section-title">
          <span className="section-bullet">•</span> Passport Details
        </h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Passport Number:</label>
            <div className="form-control">{data.passportNumber}</div>
          </div>

          <div className="form-group">
            <label>Date of Birth:</label>
            <div className="form-control">{new Date(data.dateOfBirth).toLocaleDateString()}</div>
          </div>

          <div className="form-group">
            <label>Passport Expiry Date:</label>
            <div className="form-control">{new Date(data.passportExpiry).toLocaleDateString()}</div>
          </div>

          <div className="form-group">
            <label>Nationality:</label>
            <div className="form-control">{data.nationality}</div>
          </div>

          <div className="form-group checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="ecr"
                checked={data.ecr || false}
                readOnly
                disabled
              />
              <label htmlFor="ecr">ECR</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="ecnr"
                checked={data.ecnr || false}
                readOnly
                disabled
              />
              <label htmlFor="ecnr">ECNR</label>
            </div>
          </div>
        </div>
      </section>

      {/* WORK DETAILS */}
      <section className="form-section work-details">
        <h4 className="section-title">
          <span className="section-bullet">•</span> Work Details
        </h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Occupation:</label>
            <div className="form-control">{data.occupation}</div>
          </div>

          <div className="form-group">
            <label>Place of Deployment:</label>
            <div className="form-control">{data.placeOfEmployment}</div>
          </div>

          <div className="form-group">
            <label>Last Experience:</label>
            <div className="form-control">{data.lastExperience}</div>
          </div>

          <div className="form-group">
            <label>Last Salary & Post Details:</label>
            <div className="form-control">{data.lastSalaryPostDetails}</div>
          </div>

          <div className="form-group">
            <label>Expected Salary:</label>
            <div className="form-control">{data.expectedSalary}</div>
          </div>

          <div className="form-group">
            <label>Medical Report:</label>
            <div className="form-control">{data.medicalReport}</div>
          </div>

          <div className="form-group">
            <label>Interview Status:</label>
            <div className="form-control">{data.InterviewStatus}</div>
          </div>

          <div className="form-group">
            <label>PCC Status:</label>
            <div className="form-control">{data.pccStatus}</div>
          </div>
        </div>
      </section>

      {/* FOR OFFICE USE ONLY */}
      <section className="form-section office-use">
        <h4 className="section-title">
          <span className="section-bullet">•</span> For Office Use Only
        </h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Service Charge:</label>
            <div className="form-control">{data.officeConfirmation?.ServiceCharge}</div>
          </div>

          <div className="form-group">
            <label>Medical Charge:</label>
            <div className="form-control">{data.officeConfirmation?.MedicalCharge}</div>
          </div>
        </div>
      </section>

      {/* ENHANCED OPTIONS SECTION */}
      <section className="form-section options-section">
        <h4 className="section-title">
          <span className="section-bullet">•</span> Job Options
          {!optionsLoading && options.length > 0 && (
            <Badge
              value={options.length}
              severity="success"
              style={{ marginLeft: '0.5rem' }}
            />
          )}
        </h4>

        <OptionsSection />
      </section>

      {/* FINAL APPLY BUTTON SECTION - Only show when options are loaded and available */}
      {!optionsLoading && options.length > 0 && (
        <section className="form-section final-apply-section">
          <div className="final-apply-button-container">
            <Button
              label="Final Apply for Visa"
              icon="pi pi-check"
              className="p-button-success"
              onClick={handleFinalApply}
              style={{ padding: '0.75rem 1.5rem', fontSize: '1.1rem' }}
            />
          </div>
        </section>
      )}

      {/* MODAL FOR FINAL VISA MANAGER SELECTION */}
      <Dialog
        header="Select Final Visa Manager"
        visible={showModal}
        style={{ width: '50vw' }}
        footer={modalFooter}
        onHide={() => {
          setShowModal(false);
          setSelectedManager(null);
          setSearchTerm('');
        }}
        closable={!applyLoading} // Prevent closing while applying
      >
        <div className="p-fluid">
          {managersLoading ? (
            <div className="loading-container" style={{ textAlign: 'center', padding: '2rem' }}>
              <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
              <p style={{ marginTop: '1rem', color: '#666' }}>Loading visa managers...</p>
            </div>
          ) : managersError ? (
            <div className="error-message" style={{ color: '#f44336', textAlign: 'center' }}>
              {managersError}
              <Button
                label="Retry"
                icon="pi pi-refresh"
                onClick={() => fetchFinalVisaManagers()}
                className="p-button-text p-button-sm"
                style={{ marginTop: '0.5rem' }}
              />
            </div>
          ) : (
            <Dropdown
              value={selectedManager}
              options={finalVisaManagers}
              onChange={(e) => setSelectedManager(e.value)}
              optionLabel="name"
              filter
              filterBy="name"
              showClear
              placeholder="Select a Final Visa Manager"
              style={{ width: '100%' }}
              emptyMessage="No managers found"
              disabled={applyLoading} // Disable dropdown while applying
            />
          )}
        </div>
      </Dialog>
      <ToastContainer />
    </div>
  );
};

export default VerifyLeadsFull;