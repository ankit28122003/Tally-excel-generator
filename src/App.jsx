import React, { useState } from 'react';
import { Plus, Trash2, Download, ShieldCheck, Building2, Package, AlertCircle, Settings } from 'lucide-react';
import { generateInvoiceData, exportToExcel } from './utils/generator';
import './App.css';

// SET YOUR PASSWORD HERE
const APP_PASSWORD = "ANKIT";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [error, setError] = useState(null);

  // Configuration State
  const [config, setConfig] = useState({ startInvoice: '1001', startDate: '', endDate: '' });

  // Parties State
  const [parties, setParties] = useState([
    { name: '', gstin: '', budget: '', isWithinState: true }
  ]);

  // HSN/Product State
  const [hsnList, setHsnList] = useState([
    { id: '', price: '', totalValue: '', rate: '18' }
  ]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passInput === APP_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect Access Password");
    }
  };

  const handleGenerate = () => {
    setError(null);
    try {
      if (!config.startDate || !config.endDate) {
        throw new Error("Please select a valid date range.");
      }

      // Basic validation for empty fields
      if (parties.some(p => !p.budget || !p.name)) {
        throw new Error("Please fill in all Party details and budgets.");
      }
      if (hsnList.some(h => !h.price || !h.id)) {
        throw new Error("Please fill in all HSN codes and unit prices.");
      }

      const data = generateInvoiceData(config, parties, hsnList);
      exportToExcel(data);
    } catch (err) {
      setError(err.message);
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Password Gate
  if (!isAuthenticated) {
    return (
      <div className="center-wrapper">
        <form className="auth-card" onSubmit={handleLogin}>
          <div className="auth-icon"><ShieldCheck size={44} /></div>
          <h2>System Restricted</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>Enter administrator password to access the generator</p>
          <input
            type="password"
            placeholder="Enter Password"
            value={passInput}
            onChange={e => setPassInput(e.target.value)}
            autoFocus
          />
          <button type="submit">Unlock System</button>
        </form>
      </div>
    );
  }

  return (
    <div className="center-wrapper">
      <div className="main-container">

        <header className="hero-section">
          <h1>B2B Sheet Generator</h1>
          <p>Tally-Compatible Billing & Distribution Engine</p>
        </header>

        {error && (
          <div className="error-alert">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="stack">

          {/* 1. CONFIGURATION */}
          <section className="glass-card">
            <h3 className="section-title"><Settings size={18} /> 1. Global Configuration</h3>
            <div className="grid-2 mt-20">
              <div className="input-group">
                <label>Starting Invoice No.</label>
                <input
                  value={config.startInvoice}
                  onChange={e => setConfig({ ...config, startInvoice: e.target.value })}
                  placeholder="e.g. 1001"
                />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>Start Date</label>
                  <input type="date" onChange={e => setConfig({ ...config, startDate: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>End Date</label>
                  <input type="date" onChange={e => setConfig({ ...config, endDate: e.target.value })} />
                </div>
              </div>
            </div>
          </section>

          {/* 2. PARTIES */}
          <section className="glass-card">
            <div className="flex-between">
              <h3 className="section-title"><Building2 size={18} /> 2. Parties & Monthly Budgets</h3>
              <button className="add-pill" onClick={() => setParties([...parties, { name: '', gstin: '', budget: '', isWithinState: true }])}>
                <Plus size={14} /> Add Party
              </button>
            </div>

            <div className="list-stack">
              {parties.map((p, i) => (
                <div key={i} className="list-item">
                  <div className="grid-3">
                    <input
                      placeholder="Trade Name / Party Name"
                      value={p.name}
                      onChange={e => {
                        const n = [...parties]; n[i].name = e.target.value; setParties(n);
                      }}
                    />
                    <input
                      placeholder="GSTIN Number"
                      value={p.gstin}
                      onChange={e => {
                        const n = [...parties]; n[i].gstin = e.target.value; setParties(n);
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Monthly Budget (₹)"
                      value={p.budget}
                      onChange={e => {
                        const n = [...parties]; n[i].budget = e.target.value; setParties(n);
                      }}
                    />
                  </div>
                  <div className="grid-item-footer">
                    <select
                      value={p.isWithinState}
                      onChange={e => {
                        const n = [...parties]; n[i].isWithinState = e.target.value === 'true'; setParties(n);
                      }}
                    >
                      <option value="true">Intra-State (Within State - ₹95k Daily Cap)</option>
                      <option value="false">Inter-State (Outside State - ₹45k Daily Cap)</option>
                    </select>
                    <button className="del-btn" onClick={() => setParties(parties.filter((_, idx) => idx !== i))}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. HSN MASTER */}
          <section className="glass-card">
            <div className="flex-between">
              <h3 className="section-title"><Package size={18} /> 3. Product & HSN Master</h3>
              <button className="add-pill" onClick={() => setHsnList([...hsnList, { id: '', price: '', totalValue: '', rate: '18' }])}>
                <Plus size={14} /> New Product
              </button>
            </div>

            <div className="list-stack">
              {hsnList.map((h, i) => (
                <div key={i} className="list-item">
                  <div className="grid-4">
                    <div className="input-group">
                      <label>HSN Code</label>
                      <input
                        placeholder="e.g. 6104"
                        value={h.id}
                        onChange={e => {
                          const n = [...hsnList]; n[i].id = e.target.value; setHsnList(n);
                        }}
                      />
                    </div>
                    <div className="input-group">
                      <label>GST Rate %</label>
                      <input
                        type="number"
                        placeholder="18"
                        value={h.rate}
                        onChange={e => {
                          const n = [...hsnList]; n[i].rate = e.target.value; setHsnList(n);
                        }}
                      />
                    </div>
                    <div className="input-group">
                      <label>Price/Unit</label>
                      <input
                        type="number"
                        placeholder="₹"
                        value={h.price}
                        onChange={e => {
                          const n = [...hsnList]; n[i].price = e.target.value; setHsnList(n);
                        }}
                      />
                    </div>
                    <div className="input-group">
                      <label>Total Value of Goods</label>
                      <div className="flex-gap">
                        <input
                          type="number"
                          placeholder="Stock ₹"
                          value={h.totalValue}
                          onChange={e => {
                            const n = [...hsnList]; n[i].totalValue = e.target.value; setHsnList(n);
                          }}
                        />
                        <button className="del-btn" onClick={() => setHsnList(hsnList.filter((_, idx) => idx !== i))}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* GENERATE BUTTON */}
          <button className="primary-download" onClick={handleGenerate}>
            <Download size={20} />
            Generate & Download Randomized Excel Sheet
          </button>
          <a href="https://www.linkedin.com/in/ankit-chourasia-b4942b23b?utm_source=share_via&utm_content=profile&utm_medium=member_android">

            <p style={{ textAlign: 'center', color: '#5996ec', fontSize: '1 rem' }}>
              Developed by  Ankit Chourasia
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}