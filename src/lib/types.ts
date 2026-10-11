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

export type Role = "eleve" | "prof" | "parent" | "ecole";
export type SousRoleEcole =
  | "directeur"
  | "secretaire"
  | "comptable"
  | "superecole";

export interface Compte {
  id: number;
  identifiant: string;
  mot_de_passe_hash: string;
  role: Role;
  sous_role: SousRoleEcole | null;
  nom: string;
  telephone: string | null;
  eleve_id: number | null;
  enseignant_id: number | null;
  actif: number;
  created_at: string;
}

export interface Affectation {
  id: number;
  enseignant_id: number;
  classe_id: number;
  matiere_id: number;
}

export interface AffectationAvecDetails extends Affectation {
  classe_nom: string;
  matiere_nom: string;
}

export interface Cours {
  id: number;
  titre: string;
  classe_id: number;
  matiere_id: number;
  enseignant_id: number;
  fichier_nom: string | null;
  date: string;
  created_at: string;
}

export interface CoursAvecDetails extends Cours {
  matiere_nom: string;
  classe_nom: string;
  enseignant_nom: string;
}

export interface Devoir {
  id: number;
  titre: string;
  consignes: string | null;
  classe_id: number;
  matiere_id: number;
  enseignant_id: number;
  date_limite: string;
  created_at: string;
}

export interface DevoirAvecDetails extends Devoir {
  matiere_nom: string;
  classe_nom: string;
  enseignant_nom: string;
  nb_rendus: number;
  nb_eleves: number;
}

export interface DevoirRendu {
  id: number;
  devoir_id: number;
  eleve_id: number;
  rendu_le: string | null;
  commentaire: string | null;
  fichier_nom: string | null;
  note: number | null;
  created_at: string;
}

export interface DevoirRenduAvecEleve extends DevoirRendu {
  eleve_nom: string;
  eleve_prenom: string;
}

export interface CahierTexte {
  id: number;
  classe_id: number;
  matiere_id: number;
  enseignant_id: number;
  date: string;
  contenu_seance: string;
  travail_donne: string | null;
  created_at: string;
}

export interface CahierTexteAvecDetails extends CahierTexte {
  matiere_nom: string;
  classe_nom: string;
  enseignant_nom: string;
}

export type StatutAbsence = "absent" | "retard";

export interface Absence {
  id: number;
  eleve_id: number;
  classe_id: number;
  matiere_id: number | null;
  enseignant_id: number | null;
  date: string;
  statut: StatutAbsence;
  justifiee: number;
  motif: string | null;
  created_at: string;
}

export interface AbsenceAvecDetails extends Absence {
  eleve_nom: string;
  eleve_prenom: string;
  matiere_nom: string | null;
}

export interface EdtCreneau {
  id: number;
  classe_id: number;
  matiere_id: number;
  enseignant_id: number | null;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
  salle: string | null;
  created_at: string;
}

export interface EdtCreneauAvecDetails extends EdtCreneau {
  matiere_nom: string;
  enseignant_nom: string | null;
  classe_nom: string;
}

export interface Annonce {
  id: number;
  titre: string;
  message: string;
  cible: string;
  classe_id: number | null;
  auteur_compte_id: number | null;
  created_at: string;
}

export interface AnnonceAvecDetails extends Annonce {
  auteur_nom: string | null;
  classe_nom: string | null;
}

export interface Message {
  id: number;
  expediteur_id: number;
  destinataire_id: number;
  contenu: string;
  lu: number;
  created_at: string;
}

export interface MessageAvecNoms extends Message {
  expediteur_nom: string;
  destinataire_nom: string;
}

export interface ConversationApercu {
  compte_id: number;
  nom: string;
  role: Role;
  dernier_message: string;
  dernier_message_date: string;
  non_lus: number;
}
