import { Link } from "react-router-dom";
import { LayoutDashboard, Calendar, CheckSquare, Activity, Dumbbell, FolderKanban, BarChart2, Settings } from "lucide-react";

const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Calendar", icon: Calendar, path: "/calendar" },
    { name: "Tasks", icon: CheckSquare, path: "/tasks" },
    { name: "Activities", icon: Activity, path: "/activities" },
    { name: "Workouts", icon: Dumbbell, path: "/workouts" },
    { name: "Projects", icon: FolderKanban, path: "/projects" },
    { name: "Analytics", icon: BarChart2, path: "/analytics" },
];

export default function Sidebar() {
    return (
        <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col h-full">
            <div className="p-6">
                <h1 className="text-xl font-bold tracking-tight">Shaik Tracker</h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 transition-colors"
                        >
                            <Icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                <Link
                    to="/settings"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                    Settings
                </Link>
            </div>
        </aside>
    );
}
