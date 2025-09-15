import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputText } from 'primereact/inputtext';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'primereact/badge';

function GiveOptions() {
  const [pendingLeads, setPendingLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [options, setOptions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const toast = useRef(null);

  const navigate = useNavigate();
  // This would typically come from your authentication context
  const PreVisaManager = localStorage.getItem('PreVisaManager');

  useEffect(() => {
    const fetchPendingLeads = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/options/requestedTo/${PreVisaManager}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch pending leads');
        }
        
        const data = await response.json();        
        // Filter out completed leads (those with options)
        const pendingOnly = (data.data || []).filter(lead => !hasOptions(lead));
        
        setPendingLeads(pendingOnly);
        setFilteredLeads(pendingOnly);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: err.message
        });
      } finally {
        setLoading(false);
      }
    };

    if (PreVisaManager) {
      fetchPendingLeads();
    } else {
      setError('User ID not found');
      setLoading(false);
    }
  }, [PreVisaManager]);

  // Filter leads based on search input
  const filterData = (e) => {
    const value = e.target.value;
    setGlobalFilter(value);
    
    if (!value || value === '') {
      setFilteredLeads(pendingLeads);
    } else {
      const filtered = pendingLeads.filter(lead => {
        const formName = (lead.formID?.fullName || '').toLowerCase();
        const requestedByName = (lead.requestedBy?.name || '').toLowerCase();
        const requestMessage = (lead.requestMessage || '').toLowerCase();
        const searchTerm = value.toLowerCase();
        
        return (
          formName.includes(searchTerm) ||
          requestedByName.includes(searchTerm) ||
          requestMessage.includes(searchTerm)
        );
      });
      setFilteredLeads(filtered);
    }
  };

  const handleViewLead = (lead) => {
    console.log("Selected lead:", lead);

    setSelectedLead(lead);
    setOptions("");
    
    if (lead) {
      navigate(`/give-option/ReviewFormFull`, { state: {lead } });
    } else {
      console.error("Form ID not found in lead");
    }
  };

  const handleSubmitOptions = async () => {
    if (!options.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please provide options'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`http://localhost:5000/api/options/${selectedLead._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ options }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit options');
      }

      // Remove the lead from the pending list
      setPendingLeads(prevLeads => prevLeads.filter(lead => lead._id !== selectedLead._id));
      setFilteredLeads(prevLeads => prevLeads.filter(lead => lead._id !== selectedLead._id));
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Options submitted successfully'
      });
      
      setShowDialog(false);
      setSelectedLead(null);
      setOptions('');
    } catch (err) {
      console.error('Error giving options:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'Failed to submit options. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if options have been provided
  const hasOptions = (rowData) => {
    return rowData.options && Object.keys(rowData.options).length > 0;
  };

  // Template for the action column
  const actionBodyTemplate = (rowData) => {
    // Only show view button for pending leads (no options)
    return (
      <Button
        icon="pi pi-eye"
        label="View"
        className="p-button-sm p-button-outlined p-button-info"
        onClick={() => handleViewLead(rowData)}
      />
    );
  };

  // Template for date formatting
  const dateBodyTemplate = (rowData) => {
    return new Date(rowData.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const requestedByTemplate = (rowData) => {
    const name = rowData.requestedBy?.name || 'Unknown User';
    return (
      <div>
        <div className="font-medium text-gray-900">{name}</div>
      </div>
    );
  };
  
  // Template for message column (truncate long messages)
  const messageTemplate = (rowData) => {
    const message = rowData.requestMessage || 'No message';
    return (
      <div className="max-w-xs">
        <span title={message}>
          {message.length > 50 ? message.substring(0, 50) + '...' : message}
        </span>
      </div>
    );
  };

  // Template for form ID
  const formIDTemplate = (rowData) => {
    const formName = rowData.formID?.fullName || rowData.formID || 'Unknown Form';
    return (
      <div>
        <div className="font-medium">{formName}</div>
      </div>
    );
  };

  // Template for status column (all leads are pending now)
  const statusTemplate = (rowData) => {
    return (
      <Badge 
        value="Pending" 
        severity="warning" 
      ></Badge>
    );
  };

  // Header template with search box
  const headerTemplate = () => {
    return (
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <span>Pending Leads</span>
        <span>
          <InputText
            type="search"
            value={globalFilter}
            onChange={filterData}
            placeholder="Search by name, requester or message..."
            className="w-full md:w-auto"
          />
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="3" />
        <span className="ml-3 text-lg">Loading pending leads...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <i className="pi pi-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <div className="text-red-500 text-lg">Error: {error}</div>
          <Button 
            label="Retry" 
            icon="pi pi-refresh" 
            onClick={() => window.location.reload()}
            className="mt-4"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toast ref={toast} position="top-right" />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pending Leads</h1>
        <p className="text-gray-600">Manage and provide options for incoming leads</p>
      </div>
      
      <div className="card shadow-lg">
        <DataTable 
          value={filteredLeads} 
          paginator 
          rows={10} 
          dataKey="_id"
          loading={loading}
          emptyMessage="No pending leads found."
          className="p-datatable-gridlines"
          header={headerTemplate()}
          responsiveLayout="scroll"
          stripedRows
          showGridlines
        >
          <Column 
            header="Form Details" 
            body={formIDTemplate}
            sortable 
            style={{ minWidth: '180px' }}
          />
          
          <Column 
            header="Requested By" 
            body={requestedByTemplate}
            style={{ minWidth: '220px' }}
          />
          
          <Column 
            header="Status" 
            body={statusTemplate}
            style={{ minWidth: '120px' }}
          />
          <Column 
            header="Actions" 
            body={actionBodyTemplate}
            exportable={false}
            style={{ minWidth: '120px', textAlign: 'center' }}
          />
        </DataTable>
      </div>
    </div>
  );
}

export default GiveOptions;