import { Link } from 'react-router-dom';
import { LogOut, HelpCircle } from 'lucide-react';
import React from 'react';

const Header: React.FC = () => (
  <header className="h-14 bg-white border-b border-[#EAEAEA] px-6 flex items-center justify-between sticky top-0 z-50">
    <div className="flex items-center space-x-3">
      <Link to="/" className="text-xl font-bold tracking-tight text-[#192835]">Tic Assist</Link>
      <span className="text-xs px-2 py-0.5 bg-[#E0EFE8] text-[#2E664B] rounded font-medium">CDSS Prototype</span>
    </div>
    <div className="flex items-center space-x-5 text-sm text-[#6A6A6A]">
      <button className="flex items-center space-x-1 hover:text-[#192835]"><LogOut size={15} /><span>로그아웃</span></button>
      <button className="flex items-center space-x-1 hover:text-[#192835]"><HelpCircle size={15} /><span>도움말</span></button>
    </div>
  </header>
);
export default Header;
