import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

function App() {
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [conversationState, setConversationState] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const [finalConfig, setFinalConfig] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pipelineStage, setPipelineStage] = useState('')
  const [companiesData, setCompaniesData] = useState(null)
  const [leadsData, setLeadsData] = useState(null)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Always start fresh on mount
  useEffect(() => {
    // Clear any previous conversation data
    localStorage.removeItem('sios-conversation-state')
    localStorage.removeItem('sios-messages')
    
    // Start with welcome message
    setWelcomeMessage()
  }, [])

  const setWelcomeMessage = () => {
    const welcomeMsg = [{
      id: Date.now(),
      type: 'agent',
      content: 'Welcome to SIOS ICP Form-Filling Agent.\n\nI will help you create a complete Ideal Customer Profile by asking targeted questions about missing information.\n\nDescribe your target customers (e.g., "CEOs at Series A SaaS companies in California").',
      timestamp: new Date().toISOString()
    }]
    setMessages(welcomeMsg)
  }

  // Note: We don't auto-save to localStorage anymore
  // Each page refresh = fresh conversation
  // Conversation state persists in backend database via conversation_id

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom()
    }
  }, [messages, isTyping])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  const startConversation = async (initialText) => {
    setIsTyping(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/icp/conversation/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initial_text: initialText,
          mode: 'auto',
          max_turns: 5
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      
      setConversationId(data.conversation_id)
      setSessionId(data.session_id)
      setConversationState(data.current_state)

      let agentContent = ''
      
      if (data.needs_conversation) {
        // Agent needs more information
        agentContent = `${data.message}`
        
        // Optionally show what we know so far (only if there's something)
        if (data.current_state.known_fields && Object.keys(data.current_state.known_fields).length > 0) {
          const formatted = formatKnownFields(data.current_state.known_fields)
          if (formatted !== '(No criteria specified yet)') {
            agentContent += `\n\nWhat I have so far:\n${formatted}`
          }
        }
      } else {
        // Complete on first try!
        agentContent = 'Your input is complete. ICP configuration created successfully.'
        setIsComplete(true)
        setFinalConfig(data.icp_config)
        
        if (data.icp_config) {
          agentContent += '\n\n' + formatICPConfig(data.icp_config)
        }
      }
      
      const agentMessage = {
        id: Date.now(),
        type: 'agent',
        content: agentContent,
        timestamp: new Date().toISOString(),
        state: data.current_state
      }

      setMessages(prev => [...prev, agentMessage])
      setIsTyping(false)

    } catch (error) {
      console.error('Error starting conversation:', error)
      const errorMessage = {
        id: Date.now(),
        type: 'agent',
        content: `❌ Error: Could not connect to the backend. Make sure the API is running at ${API_BASE_URL}\n\nError: ${error.message}`,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
      setIsTyping(false)
    }
  }

  const continueConversation = async (answer) => {
    setIsTyping(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/icp/conversation/${conversationId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: answer
        })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      
      setConversationState(data.current_state)

      let agentContent = ''
      
      if (data.needs_more_info) {
        // Agent needs more information
        agentContent = `${data.message}`
        
        // Show what we have collected so far
        if (data.current_state.known_fields && Object.keys(data.current_state.known_fields).length > 0) {
          const formatted = formatKnownFields(data.current_state.known_fields)
          if (formatted !== '(No criteria specified yet)') {
            agentContent += `\n\nWhat I have so far:\n${formatted}`
          }
        }
      } else {
        // Conversation complete!
        agentContent = 'ICP configuration complete. All required information collected.'
        setIsComplete(true)
        setFinalConfig(data.icp_config)
        
        if (data.icp_config) {
          agentContent += '\n\n' + formatICPConfig(data.icp_config)
        }
      }

      const agentMessage = {
        id: Date.now(),
        type: 'agent',
        content: agentContent,
        timestamp: new Date().toISOString(),
        state: data.current_state
      }
      
      setMessages(prev => [...prev, agentMessage])
      setIsTyping(false)

    } catch (error) {
      console.error('Error continuing conversation:', error)
      const errorMessage = {
        id: Date.now(),
        type: 'agent',
        content: `❌ Error: ${error.message}`,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
      setIsTyping(false)
    }
  }

  const formatKnownFields = (knownFields) => {
    const formatted = []
    
    // Extract personas (REQUIRED)
    if (knownFields.personas && Array.isArray(knownFields.personas) && knownFields.personas.length > 0) {
      const persona = knownFields.personas[0]
      const personaName = persona.name || 'Unknown'
      const seniority = persona.seniority ? ` (${persona.seniority.join(', ')})` : ''
      formatted.push(`• Persona: ${personaName}${seniority}`)
    }
    
    // Extract company filters
    if (knownFields.company_filters) {
      const cf = knownFields.company_filters
      
      // Technologies (REQUIRED)
      if (cf.technologies && cf.technologies.length > 0) {
        formatted.push(`• Technologies: ${cf.technologies.join(', ')}`)
      }
      
      // Company size (REQUIRED)
      if (cf.company_size) {
        formatted.push(`• Company size: ${cf.company_size}`)
      } else if (cf.employee_count && (cf.employee_count.min !== null || cf.employee_count.max !== null)) {
        const min = cf.employee_count.min || '?'
        const max = cf.employee_count.max || '?'
        formatted.push(`• Company size: ${min}-${max} employees`)
      }
      
      // Revenue range (REQUIRED)
      if (cf.arr_usd && (cf.arr_usd.min !== null || cf.arr_usd.max !== null)) {
        const min = cf.arr_usd.min ? `$${cf.arr_usd.min}M` : '?'
        const max = cf.arr_usd.max ? `$${cf.arr_usd.max}M` : '?'
        formatted.push(`• Revenue: ${min}-${max} ARR`)
      }
      
      // Location (AUTO-FILLED)
      if (cf.countries) {
        formatted.push(`• Location: ${cf.countries.join(', ')} (auto-filled)`)
      } else if (cf.cities || cf.states || cf.locations) {
        const locations = []
        if (cf.cities) locations.push(...(Array.isArray(cf.cities) ? cf.cities : [cf.cities]))
        if (cf.states) locations.push(...(Array.isArray(cf.states) ? cf.states : [cf.states]))
        if (cf.locations && typeof cf.locations === 'string') locations.push(cf.locations)
        if (locations.length > 0) {
          formatted.push(`• Location: ${locations.join(', ')}`)
        }
      }
      
      // Industries (RECOMMENDED)
      if (cf.industries && cf.industries.length > 0) {
        formatted.push(`• Industries: ${cf.industries.join(', ')}`)
      }
      
      // Funding (RECOMMENDED)
      if (cf.funding_stage && cf.funding_stage.length > 0) {
        formatted.push(`• Funding: ${cf.funding_stage.join(', ')}`)
      }
      
      // Founded year (OPTIONAL)
      if (cf.founded_year_min || cf.founded_year_max) {
        if (cf.founded_year_min && cf.founded_year_max) {
          formatted.push(`• Founded: ${cf.founded_year_min}-${cf.founded_year_max}`)
        } else if (cf.founded_year_min) {
          formatted.push(`• Founded: ${cf.founded_year_min}+`)
        } else {
          formatted.push(`• Founded: Before ${cf.founded_year_max}`)
        }
      }
      
      // Company types (INFO)
      if (cf.company_types && cf.company_types.length > 0) {
        formatted.push(`• Company types: ${cf.company_types.join(', ')}`)
      }
    }
    
    return formatted.length > 0 ? formatted.join('\n') : '(No criteria specified yet)'
  }

  const formatICPConfig = (config) => {
    let formatted = '📋 ICP Configuration:\n\n'
    
    if (config.personas && config.personas.length > 0) {
      formatted += `👥 Personas: ${config.personas.map(p => p.name).join(', ')}\n`
    }
    
    if (config.company_filters) {
      const filters = config.company_filters
      if (filters.industries && filters.industries.length > 0) {
        formatted += `🏢 Industries: ${filters.industries.join(', ')}\n`
      }
      if (filters.locations) {
        formatted += `📍 Locations: ${JSON.stringify(filters.locations)}\n`
      }
      if (filters.employee_count) {
        formatted += `👔 Employees: ${filters.employee_count.min || '?'} - ${filters.employee_count.max || '?'}\n`
      }
      if (filters.funding_stage && filters.funding_stage.length > 0) {
        formatted += `💰 Funding: ${filters.funding_stage.join(', ')}\n`
      }
      if (filters.founded_year_min) {
        formatted += `📅 Founded: ${filters.founded_year_min}+\n`
      }
    }
    
    formatted += '\n✅ Ready to search for companies!'
    
    return formatted
  }

  const handleSendMessage = () => {
    if (!inputValue.trim() || isTyping) {
      return
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = inputValue
    setInputValue('')

    // If no conversation started, start one. Otherwise continue.
    if (!conversationId || isComplete) {
      startConversation(messageText)
    } else {
      continueConversation(messageText)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startProcess = async () => {
    if (!finalConfig || !sessionId) {
      console.error('No final config or session ID available')
      return
    }

    setIsProcessing(true)
    
    try {
      // Step 1: Search for companies
      setPipelineStage('Searching for companies...')
      const companiesResponse = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          icp_config: finalConfig,
          limit: 10,
          session_id: sessionId
        })
      })

      if (!companiesResponse.ok) {
        throw new Error(`Company search failed: ${companiesResponse.status}`)
      }

      const companiesData = await companiesResponse.json()
      
      if (!companiesData.success || !companiesData.companies || companiesData.companies.length === 0) {
        throw new Error('No companies found matching your criteria')
      }

      setCompaniesData(companiesData)
      console.log(`Found ${companiesData.companies.length} companies`)

      // Step 2: Generate leads from companies
      setPipelineStage(`Found ${companiesData.companies.length} companies. Generating leads...`)
      
      const leadsResponse = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companies: companiesData.companies,
          personas: finalConfig.personas,
          max_leads_per_company: 25,
          session_id: sessionId
        })
      })

      if (!leadsResponse.ok) {
        throw new Error(`Lead generation failed: ${leadsResponse.status}`)
      }

      const leadsData = await leadsResponse.json()
      
      if (!leadsData.success) {
        throw new Error('Lead generation failed')
      }

      setLeadsData(leadsData)
      console.log(`Generated ${leadsData.total_leads} leads`)

      // Step 3: Complete - navigate to results
      setPipelineStage(`Complete! Found ${companiesData.companies.length} companies and ${leadsData.total_leads} leads`)
      
      // Save to localStorage for Results page
      localStorage.setItem('sios-companies', JSON.stringify(companiesData.companies))
      localStorage.setItem('sios-leads', JSON.stringify(leadsData.leads))
      localStorage.setItem('sios-session-id', sessionId)
      
      // Navigate to results after a brief delay
      setTimeout(() => {
        navigate('/results')
      }, 1500)

    } catch (error) {
      console.error('Error in pipeline:', error)
      setPipelineStage(`❌ Error: ${error.message}`)
      setIsProcessing(false)
    }
  }

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      type: 'agent',
      content: 'Chat cleared. Describe your target customers to begin.',
      timestamp: new Date().toISOString()
    }])
    setConversationId(null)
    setSessionId(null)
    setConversationState(null)
    setIsComplete(false)
    setFinalConfig(null)
    setIsProcessing(false)
    setPipelineStage('')
    setCompaniesData(null)
    setLeadsData(null)
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-logo">
            <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="25" r="4" fill="#a855f7" />
              <circle cx="16" cy="14" r="2.5" fill="#c084fc" />
              <circle cx="34" cy="14" r="2.5" fill="#c084fc" />
              <circle cx="38" cy="25" r="2.5" fill="#c084fc" />
              <circle cx="34" cy="36" r="2.5" fill="#c084fc" />
              <circle cx="16" cy="36" r="2.5" fill="#c084fc" />
              <circle cx="12" cy="25" r="2.5" fill="#c084fc" />
              <line x1="25" y1="25" x2="16" y2="14" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="25" y1="25" x2="34" y2="14" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="25" y1="25" x2="38" y2="25" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="25" y1="25" x2="34" y2="36" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="25" y1="25" x2="16" y2="36" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="25" y1="25" x2="12" y2="25" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          
          <nav className="sidebar-nav">
            <button className="sidebar-btn" aria-label="Home" title="Home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
            
            <button className="sidebar-btn" aria-label="Projects" title="Projects">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            
            <button className="sidebar-btn" onClick={clearChat} aria-label="Clear Chat" title="Clear Chat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </nav>
          
          <div className="sidebar-bottom">
            <button className="sidebar-btn" aria-label="Help" title="Help">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
            
            <button className="sidebar-btn" onClick={() => navigate('/results')} aria-label="View Results" title="View Results">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </button>
            
            <div className="sidebar-user">
              <div className="user-avatar">S</div>
            </div>
          </div>
        </div>
      </aside>
      
      <div className="gradient-background">
        <div className="chat-container">
          <header className="chat-header">
            <div className="brand">
              <div className="logo">
                <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="25" cy="25" r="4" fill="#a855f7" />
                  <circle cx="16" cy="14" r="2.5" fill="#c084fc" />
                  <circle cx="34" cy="14" r="2.5" fill="#c084fc" />
                  <circle cx="38" cy="25" r="2.5" fill="#c084fc" />
                  <circle cx="34" cy="36" r="2.5" fill="#c084fc" />
                  <circle cx="16" cy="36" r="2.5" fill="#c084fc" />
                  <circle cx="12" cy="25" r="2.5" fill="#c084fc" />
                  <line x1="25" y1="25" x2="16" y2="14" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="25" y1="25" x2="34" y2="14" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="25" y1="25" x2="38" y2="25" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="25" y1="25" x2="34" y2="36" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="25" y1="25" x2="16" y2="36" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="25" y1="25" x2="12" y2="25" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h1 className="title">SIOS</h1>
                <p className="subtitle">Smart Intelligent Orchestration System</p>
              </div>
            </div>
            {conversationState && (
              <div className="conversation-status">
                <span className="status-badge">
                  Turn {conversationState.turn_count}/{conversationState.max_turns}
                </span>
                {isComplete && (
                  <span className="status-badge complete">✓ Complete</span>
                )}
              </div>
            )}
          </header>
          
          <div className="chat-messages" ref={chatContainerRef}>
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-avatar">
                  {message.type === 'agent' ? (
                    <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="25" cy="25" r="4" fill="#a855f7" />
                      <circle cx="16" cy="14" r="2.5" fill="#c084fc" />
                      <circle cx="34" cy="14" r="2.5" fill="#c084fc" />
                      <circle cx="38" cy="25" r="2.5" fill="#c084fc" />
                      <circle cx="34" cy="36" r="2.5" fill="#c084fc" />
                      <circle cx="16" cy="36" r="2.5" fill="#c084fc" />
                      <circle cx="12" cy="25" r="2.5" fill="#c084fc" />
                      <line x1="25" y1="25" x2="16" y2="14" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="25" y1="25" x2="34" y2="14" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="25" y1="25" x2="38" y2="25" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="25" y1="25" x2="34" y2="36" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="25" y1="25" x2="16" y2="36" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="25" y1="25" x2="12" y2="25" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <span>You</span>
                  )}
                </div>
                <div className="message-content">
                  <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message agent">
                <div className="message-avatar">
                  <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="25" cy="25" r="4" fill="#a855f7" />
                    <circle cx="16" cy="14" r="2.5" fill="#c084fc" />
                    <circle cx="34" cy="14" r="2.5" fill="#c084fc" />
                    <circle cx="38" cy="25" r="2.5" fill="#c084fc" />
                    <circle cx="34" cy="36" r="2.5" fill="#c084fc" />
                    <circle cx="16" cy="36" r="2.5" fill="#c084fc" />
                    <circle cx="12" cy="25" r="2.5" fill="#c084fc" />
                    <line x1="25" y1="25" x2="16" y2="14" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="25" y1="25" x2="34" y2="14" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="25" y1="25" x2="38" y2="25" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="25" y1="25" x2="34" y2="36" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="25" y1="25" x2="16" y2="36" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="25" y1="25" x2="12" y2="25" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="message-content typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            {/* Start Process Button */}
            {isComplete && !isProcessing && (
              <div className="message agent">
                <div className="message-content">
                  <button 
                    className="start-process-btn"
                    onClick={startProcess}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Start Process
                  </button>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '8px' }}>
                    This will search for companies and generate leads based on your ICP
                  </p>
                </div>
              </div>
            )}

            {/* Pipeline Progress */}
            {isProcessing && (
              <div className="message agent">
                <div className="message-content">
                  <div className="pipeline-progress">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <p style={{ marginTop: '12px', fontSize: '0.95rem' }}>{pipelineStage}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <textarea
                className="chat-input"
                placeholder={isComplete ? "Start a new conversation..." : "Type your message here..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                rows="1"
              />
              <button 
                className="send-button" 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
