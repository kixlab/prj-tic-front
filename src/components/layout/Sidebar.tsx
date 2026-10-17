import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Users, Settings } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const items = [
    { label: '대시보드', path: '/', icon: Activity },
    { label: '환자 / Case 목록', path: '/cases', icon: Users },
    { label: '설정', path: '/settings', icon: Settings },
  ];
  return (
    <aside className="w-56 bg-white border-r border-[#EAEAEA] min-h-[calc(100vh-3.5rem)] p-4">
      <div className="text-xs font-semibold text-[#898989] px-3 mb-3">전체 메뉴</div>
      <nav className="space-y-1">
        {items.map(item => {
          const Icon = item.icon;
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link key={item.path} to={item.path} className={"flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors " + (active ? "bg-[#E0EFE8] text-[#1F4734]" : "text-[#6A6A6A] hover:bg-[#F4F4F4]")}>
              <Icon size={17} className={active ? "text-[#5EBB8F]" : "text-[#898989]"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
export default Sidebar;
