import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../CSS/ReviewFormFull.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Accordion, AccordionTab } from 'primereact/accordion';

const ReviewFormFull = () => {
  const API_URL=import.meta.env.VITE_API_URL;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState(null);
  const [visible, setVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [response, setResponse] = useState('');
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const { state } = useLocation();
  const navigate = useNavigate();
  const lead = state?.lead;
  const id = lead?.formID?._id;
  const PreVisaManager = localStorage.getItem("PreVisaManager");
     
   useEffect(() => {
    if (!localStorage.getItem('PreVisaManager')) {
      navigate('/')
    }
  })
  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const res = await axios.get(`${API_URL}/api/jobs/job/${PreVisaManager}`);
      console.log(res);
      
      const transformedJobs = res.data.data.map(job => ({
        ...job,
        displayText: `${job.jobTitle} - ${job.country?.countryName}`,
        value: job._id
      }));
      setJobs(transformedJobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Error fetching jobs");
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOptions();
    }
  }, [id]);

  const fetchOptions = async () => {
    setOptionsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/options/optionGet/${id}`);
      setOptions(res.data.data);
    } catch (err) {
      console.error('Error fetching options:', err);
      setOptionsError('Failed to load options');
    } finally {
      setOptionsLoading(false);
    }
  };

  useEffect(() => {
    if (!state) {
      navigate('/leads');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/client-form/getbyId/${id}`);
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

  const handleOption = () => {
    setVisible(true);
    fetchJobs();
  };

  const onHide = () => {
    setVisible(false);
    setSelectedJob(null);
    setResponse('');
  };

  const submitOption = async () => {
    if (!selectedJob) {
      alert("Please select a job first");
      return;
    }

    const fullJobData = jobs.find((job) => job._id === selectedJob);
    if (!fullJobData) {
      alert("Selected job not found");
      return;
    }

    const lastOptionId = options.length > 0 ? options[options.length - 1]._id : null;
    if (!lastOptionId) {
      alert("No option available to update");
      return;
    }

    try {
      const res = await axios.put(`${API_URL}/api/options/update/${lastOptionId}`, {
        options: selectedJob,
        responseMessage: response,
      });
      if (res.status === 200) {
        alert(`Option for ${fullJobData.jobTitle} in ${fullJobData.country.countryName} submitted successfully!`);
        onHide();
        fetchOptions();
      }
    } catch (error) {
      console.error("Error submitting option:", error);
      alert(error.response?.data?.message || "Failed to submit option. Please try again.");
    }
  };

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
      <Accordion>
        {options.map((option, index) => (
          <AccordionTab 
            key={option._id} 
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingRight: '1rem' }}>
                <span>Option {index + 1}</span>
                <span>{option.options?.jobTitle || 'No Job Selected'}</span>
                <span>{option.options?.country?.countryName || ''}</span>
                <span>{option.options?.salary ? `₹${option.options.salary.toLocaleString()}` : ''}</span>
              </div>
            }
          >
            <Card className="option-card" style={{ marginBottom: '1.5rem', border: '1px solid #e5e7eb' }}>
              <div className="option-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <Badge
                  value={`Option ${index + 1}`}
                  severity="info"
                  style={{ backgroundColor: '#3b82f6' }}
                />
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Created: {new Date(option.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

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
            onClick={() => navigate('/give-option')}
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
              />
              <label htmlFor="ecr">ECR</label>
            </div>
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="ecnr"
                checked={data.ecnr || false}
                readOnly
              />
              <label htmlFor="ecnr">ECNR</label>
            </div>
          </div>
        </div>
      </section>

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

      <section className="form-section options-section">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h4 className="section-title">
            <span className="section-bullet">•</span> Job Options
            {options.length > 0 && (
              <Badge
                value={options.length}
                severity="success"
                style={{ marginLeft: '0.5rem' }}
              />
            )}
          </h4>
          <Button
            onClick={handleOption}
            label="Give New Option"
            icon="pi pi-plus"
            className="p-button-sm"
            severity="secondary"
          />
        </div>

        <OptionsSection />
      </section>

      <Dialog
        header={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <i className="pi pi-plus-circle" style={{ marginRight: '0.5rem', color: '#3b82f6' }}></i>
            Select a Job & Write Response
          </div>
        }
        visible={visible}
        style={{ width: '50vw' }}
        onHide={onHide}
        breakpoints={{ '960px': '75vw', '641px': '100vw' }}
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              onClick={onHide}
              className="p-button-text p-button-secondary"
            />
            <Button
              label="Submit Option"
              icon="pi pi-check"
              onClick={submitOption}
              disabled={!selectedJob}
            />
          </div>
        }
      >
        <div className="modal-content">
          <div className="field" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="jobSelect" style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              <i className="pi pi-briefcase" style={{ marginRight: '0.5rem' }}></i>
              Select a Job <span style={{ color: '#dc2626' }}>*</span>
            </label>
            {jobsLoading ? (
              <div className="spinner-container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem'
              }}>
                <ProgressSpinner style={{ width: '30px', height: '30px' }} strokeWidth="4" />
                <span style={{ marginLeft: '1rem' }}>Loading jobs...</span>
              </div>
            ) : (
              <Dropdown
                id="jobSelect"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.value)}
                options={jobs}
                optionLabel="displayText"
                optionValue="value"
                filter
                filterBy="displayText"
                placeholder="Select a Job"
                className="w-full"
                showClear
                emptyMessage="No jobs available"
              />
            )}
          </div>

          <div className="field">
            <label htmlFor="response" style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              <i className="pi pi-comment" style={{ marginRight: '0.5rem' }}></i>
              Response Message
            </label>
            <InputTextarea
              id="response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={5}
              placeholder="Write your response message here..."
              className="w-full"
              autoResize
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ReviewFormFull;