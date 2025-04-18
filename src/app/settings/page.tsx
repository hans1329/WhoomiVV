'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Header from '@/components/Header';
import { FaShieldAlt, FaBell, FaUserCog, FaWallet, FaSave, FaToggleOn, FaToggleOff } from 'react-icons/fa';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  
  // Settings state
  const [accountSettings, setAccountSettings] = useState({
    language: 'english',
    theme: 'dark',
    timeZone: 'UTC'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    chatNotifications: true,
    tokenUpdates: true,
    marketingEmails: false
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: '30min'
  });

  useEffect(() => {
    setMounted(true);
    
    // Redirect if not authenticated
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, mounted, router]);

  // Don't render anything until component is mounted and authenticated
  if (!mounted || isLoading || !isAuthenticated) return null;

  const handleSaveSettings = () => {
    // Would save settings to backend here
    alert('Settings saved successfully!');
  };

  // Toggle switch component
  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-[#0abab5]' : 'bg-gray-700'}`}
    >
      <span 
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} 
      />
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0abab5]/30 via-slate-900 to-black text-white font-sans">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-60 h-60 bg-[#0abab5] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-60 h-60 bg-[#0abab5]/70 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-60 h-60 bg-[#0abab5]/50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-grow pt-24 pb-16 px-4 z-10">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-8 text-white">Settings</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Settings Navigation */}
            <div className="md:col-span-1">
              <div className="glassmorphism-card p-4 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
                <nav className="space-y-1">
                  <button 
                    onClick={() => setActiveTab('account')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'account' 
                        ? 'bg-[#0abab5]/20 text-[#0abab5]' 
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <FaUserCog className="w-4 h-4 mr-3" />
                    <span>Account</span>
                    {activeTab === 'account' && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0abab5]"></span>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('notification')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'notification' 
                        ? 'bg-[#0abab5]/20 text-[#0abab5]' 
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <FaBell className="w-4 h-4 mr-3" />
                    <span>Notifications</span>
                    {activeTab === 'notification' && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0abab5]"></span>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'security' 
                        ? 'bg-[#0abab5]/20 text-[#0abab5]' 
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <FaShieldAlt className="w-4 h-4 mr-3" />
                    <span>Security</span>
                    {activeTab === 'security' && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0abab5]"></span>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('wallet')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'wallet' 
                        ? 'bg-[#0abab5]/20 text-[#0abab5]' 
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <FaWallet className="w-4 h-4 mr-3" />
                    <span>Wallet</span>
                    {activeTab === 'wallet' && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0abab5]"></span>
                    )}
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Settings Content */}
            <div className="md:col-span-3">
              <div className="glassmorphism-card p-6 border border-gray-700 rounded-xl bg-gray-800/50 backdrop-blur-sm">
                {/* Account Settings */}
                {activeTab === 'account' && (
                  <div>
                    <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-700">Account Settings</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Language</label>
                        <select
                          value={accountSettings.language}
                          onChange={(e) => setAccountSettings({...accountSettings, language: e.target.value})}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                        >
                          <option value="english">English</option>
                          <option value="korean">Korean</option>
                          <option value="japanese">Japanese</option>
                          <option value="chinese">Chinese</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Theme</label>
                        <select
                          value={accountSettings.theme}
                          onChange={(e) => setAccountSettings({...accountSettings, theme: e.target.value})}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                        >
                          <option value="dark">Dark</option>
                          <option value="light">Light</option>
                          <option value="system">System Default</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Time Zone</label>
                        <select
                          value={accountSettings.timeZone}
                          onChange={(e) => setAccountSettings({...accountSettings, timeZone: e.target.value})}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                        >
                          <option value="UTC">UTC</option>
                          <option value="ET">Eastern Time</option>
                          <option value="CT">Central Time</option>
                          <option value="PT">Pacific Time</option>
                          <option value="KST">Korea Standard Time</option>
                          <option value="JST">Japan Standard Time</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Notification Settings */}
                {activeTab === 'notification' && (
                  <div>
                    <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-700">Notification Settings</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium">Email Notifications</h4>
                          <p className="text-xs text-gray-400">Receive notifications via email</p>
                        </div>
                        <ToggleSwitch
                          enabled={notificationSettings.emailNotifications}
                          onChange={() => setNotificationSettings({
                            ...notificationSettings,
                            emailNotifications: !notificationSettings.emailNotifications
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium">Chat Notifications</h4>
                          <p className="text-xs text-gray-400">Notifications for new messages</p>
                        </div>
                        <ToggleSwitch
                          enabled={notificationSettings.chatNotifications}
                          onChange={() => setNotificationSettings({
                            ...notificationSettings,
                            chatNotifications: !notificationSettings.chatNotifications
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium">Token Updates</h4>
                          <p className="text-xs text-gray-400">Notifications for token balance changes</p>
                        </div>
                        <ToggleSwitch
                          enabled={notificationSettings.tokenUpdates}
                          onChange={() => setNotificationSettings({
                            ...notificationSettings,
                            tokenUpdates: !notificationSettings.tokenUpdates
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium">Marketing Emails</h4>
                          <p className="text-xs text-gray-400">Receive promotional content and updates</p>
                        </div>
                        <ToggleSwitch
                          enabled={notificationSettings.marketingEmails}
                          onChange={() => setNotificationSettings({
                            ...notificationSettings,
                            marketingEmails: !notificationSettings.marketingEmails
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-700">Security Settings</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                          <p className="text-xs text-gray-400">Add an extra layer of security to your account</p>
                        </div>
                        <ToggleSwitch
                          enabled={securitySettings.twoFactorAuth}
                          onChange={() => setSecuritySettings({
                            ...securitySettings,
                            twoFactorAuth: !securitySettings.twoFactorAuth
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium">Login Notifications</h4>
                          <p className="text-xs text-gray-400">Receive notifications for new logins</p>
                        </div>
                        <ToggleSwitch
                          enabled={securitySettings.loginNotifications}
                          onChange={() => setSecuritySettings({
                            ...securitySettings,
                            loginNotifications: !securitySettings.loginNotifications
                          })}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Session Timeout</label>
                        <select
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                        >
                          <option value="15min">15 minutes</option>
                          <option value="30min">30 minutes</option>
                          <option value="1hour">1 hour</option>
                          <option value="1day">1 day</option>
                          <option value="never">Never</option>
                        </select>
                      </div>
                      
                      <div className="mt-6 p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
                        <h4 className="text-sm font-medium text-red-400 mb-2">Danger Zone</h4>
                        <button className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Wallet Settings */}
                {activeTab === 'wallet' && (
                  <div>
                    <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-700">Wallet Settings</h2>
                    
                    <div className="mb-6">
                      <div className="text-sm text-gray-400 mb-2">Connected Wallet</div>
                      <div className="flex items-center p-4 bg-gray-900/40 rounded-lg">
                        <FaWallet className="w-5 h-5 text-[#0abab5] mr-3" />
                        <div>
                          <div className="text-sm font-medium">
                            {user?.walletAddress ? (
                              <span className="font-mono">{user.walletAddress}</span>
                            ) : (
                              'No wallet connected'
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Connected via {user?.authProvider || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-sm text-gray-400 mb-2">Default Gas Settings</div>
                      <select
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                        defaultValue="standard"
                      >
                        <option value="fast">Fast</option>
                        <option value="standard">Standard</option>
                        <option value="slow">Slow</option>
                      </select>
                      <div className="text-xs text-gray-400 mt-1">
                        This setting affects transaction confirmation speed
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Token Display Preferences</div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg">
                          <div className="text-sm">Show token value in USD</div>
                          <ToggleSwitch enabled={true} onChange={() => {}} />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg">
                          <div className="text-sm">Hide small token balances</div>
                          <ToggleSwitch enabled={false} onChange={() => {}} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Save Button - only show for account, notification, and security tabs */}
                {activeTab !== 'wallet' && (
                  <div className="mt-8">
                    <button 
                      onClick={handleSaveSettings}
                      className="flex items-center justify-center w-full px-4 py-3 bg-[#0abab5] hover:bg-[#0abab5]/80 rounded-lg text-white text-sm font-medium transition-colors"
                    >
                      <FaSave className="w-4 h-4 mr-2" />
                      Save Settings
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 mt-auto">
        <div className="container mx-auto px-4">
          <div className="border-t border-[#0abab5]/20 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center">
                <img src="/logo.svg" alt="Whoomi Logo" className="h-5 w-5 mr-2" />
                <span className="text-sm font-semibold text-white">Whoomi</span>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-gray-500 text-xs">
                  © {new Date().getFullYear()} Whoomi. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 