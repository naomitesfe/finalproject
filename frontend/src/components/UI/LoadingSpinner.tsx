const LoadingSpinner = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div className="animate-spin h-12 w-12 border-4 border-[#00AEEF] border-t-transparent rounded-full"></div>
    </div>
  );
};

export default LoadingSpinner;
