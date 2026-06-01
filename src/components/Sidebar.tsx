import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  HeartPulse,
  LogOut,
  X,
  PlusSquare,
  Pill
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { profile, signOut } = useAuth();

  const overviewItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "patient", "doctor", "nurse"] },
    { to: "/my-medications", label: "My Medications", icon: Pill, roles: ["patient"] },
    { to: "/my-doctor", label: "My Doctor", icon: Stethoscope, roles: ["patient"] },
    { to: "/my-nurse", label: "My Nurse", icon: HeartPulse, roles: ["patient"] },
    { to: "/doctors", label: "Doctors", icon: Stethoscope, roles: ["admin"] },
    { to: "/nurses", label: "Nurses", icon: HeartPulse, roles: ["admin"] },
    { to: "/patients", label: "Patients", icon: Users, roles: ["admin", "doctor", "nurse"] },
  ];

  const filteredOverview = overviewItems.filter(
    (item) => profile && item.roles.includes(profile.role)
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64
          bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col
        `}
      >
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gray-900 rounded-md">
              <PlusSquare size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Medicare</h1>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="mb-6">
            <h2 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-3 px-2">Overview</h2>
            <nav className="space-y-1">
              {filteredOverview.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 space-y-1">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
