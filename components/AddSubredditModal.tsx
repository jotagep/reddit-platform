import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaPlus } from 'react-icons/fa';

interface AddSubredditModalProps {
  onAddSubreddit: (subreddit: string) => void;
}

const AddSubredditModal: React.FC<AddSubredditModalProps> = ({ onAddSubreddit }) => {
  const [subredditInput, setSubredditInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subredditInput.trim()) {
      onAddSubreddit(subredditInput.trim());
      setSubredditInput('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-full flex items-center">
          <FaPlus className="mr-2" />
          Añadir Subreddit
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-orange-500">Añadir nuevo Subreddit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            placeholder="Nombre del subreddit o URL"
            value={subredditInput}
            onChange={(e) => setSubredditInput(e.target.value)}
            className="bg-gray-700 text-white border-gray-600 focus:border-orange-500 focus:ring-orange-500"
          />
          <Button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
          >
            Añadir
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubredditModal;