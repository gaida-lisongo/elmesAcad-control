"use client";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Disclosure } from "@headlessui/react";
import { createOrUpdateFAQ, deleteFAQItem } from "@/lib/actions/offre-actions";

interface FAQItem {
  question: string;
  answer: string;
}

interface OffreFAQProps {
  packageId: string;
  faqItems: FAQItem[];
  isAdmin?: boolean;
}

const OffreFAQ = ({ packageId, faqItems, isAdmin = false }: OffreFAQProps) => {
  const [items, setItems] = useState<FAQItem[]>(faqItems);
  const [isAdding, setIsAdding] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    setLoading(true);
    try {
      const updatedItems = [
        ...items,
        { question: newQuestion, answer: newAnswer },
      ];
      await createOrUpdateFAQ(packageId, updatedItems);
      setItems(updatedItems);
      setNewQuestion("");
      setNewAnswer("");
      setIsAdding(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de FAQ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (index: number) => {
    setLoading(true);
    try {
      const updatedItems = [...items];
      updatedItems[index] = { question: newQuestion, answer: newAnswer };
      await createOrUpdateFAQ(packageId, updatedItems);
      setItems(updatedItems);
      setEditIndex(null);
      setNewQuestion("");
      setNewAnswer("");
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) return;

    setLoading(true);
    try {
      await deleteFAQItem(packageId, index);
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (index: number) => {
    setEditIndex(index);
    setNewQuestion(items[index].question);
    setNewAnswer(items[index].answer);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setIsAdding(false);
    setNewQuestion("");
    setNewAnswer("");
  };

  return (
    <section className="py-12 md:py-17 bg-white dark:bg-darkmode">
      <div className="container mx-auto lg:max-w-xl md:max-w-screen-md px-4">
        {/* Section Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Icon icon="mdi:help-circle" className="text-primary" width="20" />
            <span className="text-sm font-medium text-primary">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-midnight_text dark:text-white mb-4">
            Questions fréquentes
          </h2>
          <p className="text-lg text-black/70 dark:text-white/70 max-w-2xl mx-auto">
            Trouvez rapidement les réponses à vos questions
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {editIndex === index ? (
                // Edit Mode
                <div className="bg-gray-50 dark:bg-darkmode/50 border border-primary rounded-xl p-6">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="w-full px-4 py-3 border border-border dark:border-darkborder rounded-lg bg-white dark:bg-darkmode text-midnight_text dark:text-white mb-4"
                    placeholder="Question"
                  />
                  <textarea
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-border dark:border-darkborder rounded-lg bg-white dark:bg-darkmode text-midnight_text dark:text-white mb-4 resize-none"
                    placeholder="Réponse"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(index)}
                      disabled={
                        loading || !newQuestion.trim() || !newAnswer.trim()
                      }
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Icon icon="mdi:check" width="20" />
                      Enregistrer
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-midnight_text dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <Disclosure>
                  {({ open }) => (
                    <div className="bg-white dark:bg-darkmode border border-border dark:border-darkborder rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      <Disclosure.Button className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-darkmode/50 transition-colors">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center">
                            <Icon
                              icon="mdi:comment-question"
                              className="text-primary"
                              width="24"
                            />
                          </div>
                          <span className="font-semibold text-lg text-midnight_text dark:text-white pr-4">
                            {item.question}
                          </span>
                        </div>
                        <Icon
                          icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
                          className="text-primary flex-shrink-0"
                          width="24"
                        />
                      </Disclosure.Button>

                      <Disclosure.Panel className="px-6 pb-6 pt-2">
                        <div className="pl-14 text-black/70 dark:text-white/70 leading-relaxed">
                          {item.answer}
                        </div>

                        {isAdmin && (
                          <div className="pl-14 mt-4 flex gap-2">
                            <button
                              onClick={() => startEdit(index)}
                              disabled={loading}
                              className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
                            >
                              <Icon icon="mdi:pencil" width="16" />
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(index)}
                              disabled={loading}
                              className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-1"
                            >
                              <Icon icon="mdi:delete" width="16" />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>
              )}
            </div>
          ))}

          {/* Add New FAQ */}
          {isAdmin && (
            <div className="mt-8">
              {isAdding ? (
                <div className="bg-gray-50 dark:bg-darkmode/50 border border-primary rounded-xl p-6 animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon
                      icon="mdi:plus-circle"
                      className="text-primary"
                      width="24"
                    />
                    <h3 className="font-semibold text-midnight_text dark:text-white">
                      Nouvelle question
                    </h3>
                  </div>
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="w-full px-4 py-3 border border-border dark:border-darkborder rounded-lg bg-white dark:bg-darkmode text-midnight_text dark:text-white mb-4"
                    placeholder="Question"
                  />
                  <textarea
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-border dark:border-darkborder rounded-lg bg-white dark:bg-darkmode text-midnight_text dark:text-white mb-4 resize-none"
                    placeholder="Réponse"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAdd}
                      disabled={
                        loading || !newQuestion.trim() || !newAnswer.trim()
                      }
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Icon icon="mdi:check" width="20" />
                      Ajouter
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-midnight_text dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full p-6 border-2 border-dashed border-border dark:border-darkborder rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-black/70 dark:text-white/70 hover:text-primary"
                >
                  <Icon icon="mdi:plus-circle" width="24" />
                  <span className="font-medium">Ajouter une question</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};

export default OffreFAQ;
