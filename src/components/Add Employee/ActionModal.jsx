// components/UserActionsModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Edit, Ban, CheckCircle, Trash, Key, 
  Eye, Download, Lock, X, AlertCircle, Check, Loader2 
} from "lucide-react";

const UserActionsModal = ({
  actionUser,
  onClose,
  onEdit,
  onDelete,
  onActionSelect,
  onResetPassword,
  onToggle2FA,
  onExportData
}) => {
  const [confirmAction, setConfirmAction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  if (!actionUser) return null;

  const handleAction = async (actionId, user) => {
    setIsLoading(true);
    setActionFeedback(null);

    try {
      switch (actionId) {
        case 'edit':
          onEdit(user);
          break;
        case 'suspend':
        case 'activate':
          await onActionSelect(actionId, user);
          setActionFeedback({
            type: 'success',
            message: `User ${actionId === 'suspend' ? 'suspended' : 'activated'} successfully`
          });
          break;
        case 'delete':
          setConfirmAction({
            type: 'delete',
            user,
            message: `Are you sure you want to delete ${user.FullName}? This action cannot be undone.`
          });
          break;
        case 'reset-password':
          await onResetPassword(user._id);
          setActionFeedback({
            type: 'success',
            message: 'Password reset email sent successfully'
          });
          break;
        case 'toggle-2fa':
          await onToggle2FA(user._id, !user.isTwoFactorEnabled);
          setActionFeedback({
            type: 'success',
            message: `2FA ${!user.isTwoFactorEnabled ? 'enabled' : 'disabled'} successfully`
          });
          break;
        case 'export-data':
          const data = await onExportData(user._id);
          downloadJSON(data, `${user.FullName}_data.json`);
          setActionFeedback({
            type: 'success',
            message: 'Data exported successfully'
          });
          break;
        case 'view-logs':
          onActionSelect('view-logs', user);
          break;
        default:
          break;
      }
    } catch (error) {
      setActionFeedback({
        type: 'error',
        message: error.message || 'Action failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(confirmAction.user._id, confirmAction.user.FullName);
      setActionFeedback({
        type: 'success',
        message: 'User deleted successfully'
      });
      setTimeout(onClose, 1500);
    } catch (error) {
      setActionFeedback({
        type: 'error',
        message: error.message || 'Delete failed'
      });
    } finally {
      setIsLoading(false);
      setConfirmAction(null);
    }
  };

  const actions = [
    {
      id: "edit",
      label: "Edit User",
      icon: <Edit className="w-5 h-5" />,
      color: "bg-green-500/20 text-green-300 hover:bg-green-500/30",
      disabled: isLoading
    },
    {
      id: actionUser.status === "active" ? "suspend" : "activate",
      label: actionUser.status === "active" ? "Suspend User" : "Activate User",
      icon: actionUser.status === "active" ? <Ban className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />,
      color: actionUser.status === "active" 
        ? "bg-red-500/20 text-red-300 hover:bg-red-500/30" 
        : "bg-green-500/20 text-green-300 hover:bg-green-500/30",
      disabled: isLoading
    },
    {
      id: "delete",
      label: "Delete User",
      icon: <Trash className="w-5 h-5" />,
      color: "bg-red-600/20 text-red-300 hover:bg-red-600/30",
      disabled: isLoading
    },
    {
      id: "reset-password",
      label: "Reset Password",
      icon: <Key className="w-5 h-5" />,
      color: "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30",
      disabled: isLoading
    },
    {
      id: "view-logs",
      label: "View Activity Logs",
      icon: <Eye className="w-5 h-5" />,
      color: "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30",
      disabled: isLoading
    },
    {
      id: "export-data",
      label: "Export User Data",
      icon: <Download className="w-5 h-5" />,
      color: "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30",
      disabled: isLoading
    },
    {
      id: "toggle-2fa",
      label: actionUser.isTwoFactorEnabled ? "Disable 2FA" : "Enable 2FA",
      icon: <Lock className="w-5 h-5" />,
      color: "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30",
      disabled: isLoading
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-slate-900/30 backdrop-blur-xl rounded-2xl shadow-2xl p-6 relative max-w-md w-full border border-slate-800"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Manage {actionUser.FullName}
            <span className={`text-sm px-2 py-1 rounded-full ml-2 ${
              actionUser.status === 'active' 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-red-500/20 text-red-300'
            }`}>
              {actionUser.status}
            </span>
          </h3>

          {/* Action Feedback */}
          {actionFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${
                actionFeedback.type === 'success' 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-red-500/20 text-red-300'
              }`}
            >
              {actionFeedback.type === 'success' 
                ? <Check className="w-5 h-5" /> 
                : <AlertCircle className="w-5 h-5" />
              }
              <span className="text-sm">{actionFeedback.message}</span>
            </motion.div>
          )}

          {/* Confirmation Dialog */}
          {confirmAction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <h4 className="font-bold text-red-300">Confirm Action</h4>
              </div>
              <p className="text-gray-300 mb-4">{confirmAction.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex-1 flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isLoading ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => setConfirmAction(null)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg flex-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Actions List */}
          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2">
            {actions.map((action) => (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAction(action.id, actionUser)}
                disabled={action.disabled}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${action.color} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading && action.disabled ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  action.icon
                )}
                {action.label}
              </motion.button>
            ))}
          </div>

          {/* User Info */}
          <div className="text-sm text-gray-400 mb-4 p-3 bg-slate-800/30 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div>Email: <span className="text-gray-300">{actionUser.email}</span></div>
              <div>Role: <span className="text-gray-300">{actionUser.role}</span></div>
              <div>Last Login: <span className="text-gray-300">
                {new Date(actionUser.lastLogin).toLocaleDateString()}
              </span></div>
              <div>2FA: <span className={`${actionUser.isTwoFactorEnabled ? 'text-green-400' : 'text-red-400'}`}>
                {actionUser.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span></div>
            </div>
          </div>

          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 text-gray-300 hover:bg-slate-800/70 transition font-semibold"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserActionsModal;