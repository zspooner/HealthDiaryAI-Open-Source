import React from 'react';
import { Button } from '@/components/ui/button';

export function TestButton() {
  const handleClick = () => {
    console.log('Test button clicked!');
    alert('Button clicked!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!');
    alert('Form submitted!');
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold">Button Test</h2>
      
      {/* Test React Button */}
      <div>
        <h3>React Button:</h3>
        <Button onClick={handleClick} variant="default">
          Click Me (React Button)
        </Button>
      </div>
      
      {/* Test HTML Button */}
      <div>
        <h3>HTML Button:</h3>
        <button 
          onClick={handleClick}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Click Me (HTML Button)
        </button>
      </div>
      
      {/* Test Form */}
      <div>
        <h3>Form with Submit Button:</h3>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input 
            type="text" 
            placeholder="Enter something"
            className="border p-2 rounded"
          />
          <Button type="submit" variant="default">
            Submit (React Button)
          </Button>
          <button 
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Submit (HTML Button)
          </button>
        </form>
      </div>
    </div>
  );
} 