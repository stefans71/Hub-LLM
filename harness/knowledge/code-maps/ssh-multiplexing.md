 INFRA-01: SSH Connection Multiplexing completed.                                                                                                                                               
                                                                                                                                                                                                 
  Summary                                                                                                                                                                                        
                                                                                                                                                                                                 
  Implemented a multiplexed SSH architecture where:                                                                                                                                              
                                                                                                                                                                                                 
  1. ONE connection per VPS - VPSConnectionManager singleton manages a single VPSConnection per server_id                                                                                        
  2. Multiple PTY channels - Each terminal gets its own PTYChannel on the shared connection                                                                                                      
  3. Shared fate - When the SSH connection drops, ALL terminals to that VPS receive connection_status message and show disconnected simultaneously                                               
  4. Status broadcasting - Status listeners notify all WebSocket clients when connection state changes                                                                                           
                                                                                                                                                                                                 
  Key Files Created/Modified                                                                                                                                                                     
  ┌───────────────────────────────────────────┬───────────────────────────────────────────────────────────────┐                                                                                  
  │                   File                    │                            Changes                            │                                                                                  
  ├───────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤                                                                                  
  │ backend/services/vps_connection.py        │ NEW - VPSConnectionManager, VPSConnection, PTYChannel classes │                                                                                  
  ├───────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤                                                                                  
  │ backend/routers/terminal.py               │ Use vps_manager, create channels instead of connections       │                                                                                  
  ├───────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤                                                                                  
  │ backend/routers/ssh.py                    │ Updated terminal endpoint to use channels                     │                                                                                  
  ├───────────────────────────────────────────┼───────────────────────────────────────────────────────────────┤                                                                                  
  │ frontend/src/components/MultiTerminal.jsx │ Handle connection_status message type                         │                                                                                  
  └───────────────────────────────────────────┴───────────────────────────────────────────────────────────────┘                                                                                  
  Architecture                                                                                                                                                                                   
                                                                                                                                                                                                 
  ┌─────────────────────────────────────────┐                                                                                                                                                    
  │ VPSConnectionManager (singleton)        │                                                                                                                                                    
  │ - _connections[server_id] → VPSConnection│                                                                                                                                                   
  └─────────────────────────────────────────┘                                                                                                                                                    
                  │                                                                                                                                                                              
                  ▼                                                                                                                                                                              
  ┌─────────────────────────────────────────┐                                                                                                                                                    
  │ VPSConnection (per VPS)                 │                                                                                                                                                    
  │ - conn: asyncssh.SSHClientConnection    │                                                                                                                                                    
  │ - channels: {id: PTYChannel, ...}       │                                                                                                                                                    
  │ - _status_listeners: [callbacks]        │                                                                                                                                                    
  └─────────────────────────────────────────┘                                                                                                                                                    
                  │                                                                                                                                                                              
      ┌───────────┼───────────┐                                                                                                                                                                  
      ▼           ▼           ▼                                                                                                                                                                  
  PTYChannel  PTYChannel  PTYChannel                                                                                                                                                             
  (Terminal1) (Terminal2) (Terminal3)                                                                                                                                                            
                                                                                                                                                                                                 
  Test Case                                                                                                                                                                                      
                                                                                                                                                                                                 
  Open 3 terminals to same VPS. Kill SSH. All 3 show disconnected simultaneously.                                                                                                                
                                                                                                                                                                                                 
  The backend code is verified to import and run. Real-world testing requires a VPS connection to verify the shared-fate behavior.                                                               
                                                                                                                                      