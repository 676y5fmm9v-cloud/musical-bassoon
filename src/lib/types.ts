export type Genre = "M" | "F";
export type StatutEleve = "actif" | "inactif";
export type TypeNote = "devoir" | "composition";

export interface Enseignant {
  id: number;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  specialite: string | null;
  date_embauche: string | null;
  created_at: string;
}

export interface Classe {
  id: number;
  nom: string;
  niveau: string;
  annee_scolaire: string;
  enseignant_principal_id: number | null;
  capacite: number | null;
  created_at: string;
}

export interface ClasseAvecDetails extends Classe {
  enseignant_nom: string | null;
  effectif: number;
}

export interface Eleve {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  date_naissance: string | null;
  genre: Genre;
  classe_id: number | null;
  nom_parent: string | null;
  telephone_parent: string | null;
  email_parent: string | null;
  adresse: string | null;
  date_inscription: string;
  statut: StatutEleve;
  created_at: string;
}

export interface EleveAvecClasse extends Eleve {
  classe_nom: string | null;
}

export interface Matiere {
  id: number;
  nom: string;
  coefficient: number;
  created_at: string;
}

export interface Note {
  id: number;
  eleve_id: number;
  matiere_id: number;
  enseignant_id: number | null;
  trimestre: number;
  type: TypeNote;
  valeur: number;
  date: string;
  created_at: string;
}

export interface NoteAvecDetails extends Note {
  matiere_nom: string;
  coefficient: number;
  eleve_nom: string;
  eleve_prenom: string;
}
