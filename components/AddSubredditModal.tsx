import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
        <Button variant="outline">Añadir Subreddit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir nuevo Subreddit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Nombre del subreddit o URL"
            value={subredditInput}
            onChange={(e) => setSubredditInput(e.target.value)}
          />
          <Button type="submit">Añadir</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubredditModal;