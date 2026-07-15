import React from "react";
import { PanelLeft } from "lucide-react";

const SidebarContext = React.createContext(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

const SidebarProvider = React.forwardRef((props, ref) => {
  const { defaultOpen = true, className, children, ...rest } = props;
  
  const [open, setOpen] = React.useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sidebar_open');
        return saved !== null ? JSON.parse(saved) : defaultOpen;
      } catch (_) {
        return defaultOpen;
      }
    }
    return defaultOpen;
  });
  
  const toggleSidebar = React.useCallback(() => {
    setOpen((prev) => {
      const nextVal = !prev;
      try {
        localStorage.setItem('sidebar_open', JSON.stringify(nextVal));
      } catch (_) {}
      return nextVal;
    });
  }, []);
  
  return (
    <SidebarContext.Provider value={{ open, setOpen, toggleSidebar }}>
      <div ref={ref} className={`flex h-screen ${className}`} {...rest}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
});
SidebarProvider.displayName = "SidebarProvider";

const Sidebar = React.forwardRef((props, ref) => {
  const { children, className = "", ...rest } = props;
  const { open } = useSidebar();
  
  return (
    <div
      ref={ref}
      className={`flex flex-col h-screen fixed left-0 top-0 bottom-0 z-20 shrink-0 bg-gray-900 text-white transition-all duration-200 ${
        open ? "w-64 items-start" : "w-20 items-center"
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
});
Sidebar.displayName = "Sidebar";

const SidebarTrigger = React.forwardRef((props, ref) => {
  const { toggleSidebar } = useSidebar();
  const { className = "", ...rest } = props;
  
  return (
    <button
      ref={ref}
      onClick={toggleSidebar}
      className={`p-2 hover:bg-gray-700 rounded-none transition ${className}`}
      {...rest}
    >
      <PanelLeft className="w-5 h-5" />
    </button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarInset = React.forwardRef((props, ref) => {
  const { className = "", children, ...rest } = props;
  const { open } = useSidebar();
  
  return (
    <main 
      ref={ref} 
      className={`flex-1 flex flex-col h-screen overflow-hidden bg-white transition-all duration-200 ${
        open ? "pl-64" : "pl-20"
      } ${className}`} 
      {...rest}
    >
      {children}
    </main>
  );
});
SidebarInset.displayName = "SidebarInset";

const SidebarHeader = React.forwardRef((props, ref) => {
  const { className = "", children, ...rest } = props;
  const { open } = useSidebar();
  return (
    <div ref={ref} className={`${open ? 'p-4' : 'p-2'} border-b border-gray-700 ${className}`} {...rest}>
      {children}
    </div>
  );
});
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef((props, ref) => {
  const { className = "", children, ...rest } = props;
  const { open } = useSidebar();
  return (
    <div
      ref={ref}
      className={`flex-1 ${open ? 'overflow-auto' : 'flex flex-col justify-center'} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
});
SidebarContent.displayName = "SidebarContent";

const SidebarGroup = React.forwardRef((props, ref) => {
  const { className = "", children, ...rest } = props;
  const { open } = useSidebar();
  return (
    <div ref={ref} className={`${open ? 'p-2' : 'p-0'} ${className}`} {...rest}>
      {children}
    </div>
  );
});
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef((props, ref) => {
  const { className = "", children, ...rest } = props;
  return (
    <h3 ref={ref} className={`text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wide ${className}`} {...rest}>
      {children}
    </h3>
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupContent = React.forwardRef((props, ref) => {
  const { className = "", children, ...rest } = props;
  const { open } = useSidebar();
  return (
    <div ref={ref} className={`${open ? '' : 'px-0'} ${className}`} {...rest}>
      {children}
    </div>
  );
});
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = React.forwardRef((props, ref) => {
  const { className = "", children, ...rest } = props;
  const { open } = useSidebar();
  return (
    <ul
      ref={ref}
      className={`list-none p-0 m-0 ${open ? 'space-y-1' : 'flex flex-col items-center gap-1'} ${className}`}
      {...rest}
    >
      {children}
    </ul>
  );
});
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef((props, ref) => {
  const { className = "", children, ...rest } = props;
  const { open } = useSidebar();
  return (
    <li
      ref={ref}
      className={`list-none ${open ? className : `w-full flex justify-center ${className}`}`}
      {...rest}
    >
      {children}
    </li>
  );
});
SidebarMenuItem.displayName = "SidebarMenuItem";

const SidebarMenuButton = React.forwardRef((props, ref) => {
  const { asChild, isActive, className = "", children, ...rest } = props;
  const { open } = useSidebar();

  const openClasses = `flex items-center gap-3 w-full px-3.5 py-2.5 rounded-none text-[12px] font-bold uppercase tracking-wider transition-all duration-200 hover:bg-neutral-800/80 hover:text-white ${isActive ? "bg-neutral-800 text-white font-black" : "text-gray-400"} ${className}`;
  const closedClasses = `flex items-center justify-center w-11 h-11 rounded-none transition-all duration-200 hover:bg-neutral-800/80 hover:text-white ${isActive ? "bg-neutral-800 text-white" : "text-gray-400"} ${className}`;

  if (asChild && children) {
    return React.cloneElement(children, {
      ...rest,
      ref,
      className: open ? openClasses : closedClasses,
    });
  }

  return (
    <button
      ref={ref}
      className={open ? openClasses : closedClasses}
      {...rest}
    >
      {children}
    </button>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

export {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
