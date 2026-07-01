/**
 * Expands breaking-bad-vocab.json with slice-of-life & adulting categories.
 * Run: node scripts/expand-breaking-bad.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, '../shared/data/breaking-bad-vocab.json');

const data = JSON.parse(readFileSync(PATH, 'utf8'));

const NEW_CATEGORIES = [
  {
    id: 'daily-adulting',
    label: 'Daily life & adulting',
    emoji: '🏠',
    words: [
      { french: 'facture', english: 'bill / invoice', exampleFr: 'Il faut payer les factures.', exampleEn: 'We have to pay the bills.', note: 'Walt & Skyler household stress' },
      { french: 'hypothèque', english: 'mortgage', exampleFr: 'On a encore l\'hypothèque sur la maison.', exampleEn: 'We still have the mortgage on the house.' },
      { french: 'compte en banque', english: 'bank account', exampleFr: 'Le compte en banque est à sec.', exampleEn: 'The bank account is empty.' },
      { french: 'épicerie', english: 'grocery store', exampleFr: 'Je passe à l\'épicerie.', exampleEn: 'I\'m stopping by the grocery store.' },
      { french: 'courses', english: 'groceries / errands', exampleFr: 'Je fais les courses.', exampleEn: 'I\'m doing the groceries.' },
      { french: 'laver la vaisselle', english: 'to do the dishes', exampleFr: 'Tu peux laver la vaisselle ?', exampleEn: 'Can you do the dishes?' },
      { french: 'aspirateur', english: 'vacuum cleaner', exampleFr: 'Passe l\'aspirateur dans le salon.', exampleEn: 'Vacuum the living room.' },
      { french: 'tondeuse', english: 'lawn mower', exampleFr: 'Walt tond la pelouse le dimanche.', exampleEn: 'Walt mows the lawn on Sunday.' },
      { french: 'pelouse', english: 'lawn', exampleFr: 'La pelouse est trop haute.', exampleEn: 'The lawn is too tall.' },
      { french: 'garage', english: 'garage', exampleFr: 'Range le garage.', exampleEn: 'Clean up the garage.' },
      { french: 'classe moyenne', english: 'middle class', exampleFr: 'Une famille de classe moyenne.', exampleEn: 'A middle-class family.' },
      { french: 'budget', english: 'budget', exampleFr: 'On n\'a pas le budget.', exampleEn: 'We don\'t have the budget.' },
      { french: 'économiser', english: 'to save money', exampleFr: 'Il faut économiser.', exampleEn: 'We need to save money.' },
      { french: 'dépenser', english: 'to spend', exampleFr: 'Tu dépenses trop.', exampleEn: 'You spend too much.' },
      { french: 'salaire', english: 'salary', exampleFr: 'Mon salaire de prof ne suffit pas.', exampleEn: 'My teacher salary isn\'t enough.' },
      { french: 'heures sup', english: 'overtime', exampleFr: 'Il fait des heures sup au car wash.', exampleEn: 'He works overtime at the car wash.' },
      { french: 'embaucher', english: 'to hire', exampleFr: 'On va t\'embaucher.', exampleEn: 'We\'re going to hire you.' },
      { french: 'licencier', english: 'to fire / lay off', exampleFr: 'Ils m\'ont licencié.', exampleEn: 'They laid me off.' },
      { french: 'assurance', english: 'insurance', exampleFr: 'L\'assurance ne couvre pas tout.', exampleEn: 'Insurance doesn\'t cover everything.' },
      { french: 'rendez-vous médical', english: 'medical appointment', exampleFr: 'J\'ai un rendez-vous médical demain.', exampleEn: 'I have a medical appointment tomorrow.' },
    ],
  },
  {
    id: 'family-slice',
    label: 'Family & slice of life',
    emoji: '👨‍👩‍👦',
    words: [
      { french: 'petit-déjeuner', english: 'breakfast', exampleFr: 'On prend le petit-déjeuner ensemble.', exampleEn: 'We have breakfast together.' },
      { french: 'dîner', english: 'dinner', exampleFr: 'Le dîner est prêt.', exampleEn: 'Dinner is ready.' },
      { french: 'anniversaire', english: 'birthday', exampleFr: 'C\'est son anniversaire.', exampleEn: 'It\'s his birthday.' },
      { french: 'adolescent', english: 'teenager', exampleFr: 'Notre adolescent ne parle plus.', exampleEn: 'Our teenager doesn\'t talk anymore.' },
      { french: 'bébé', english: 'baby', exampleFr: 'Le bébé dort.', exampleEn: 'The baby is sleeping.' },
      { french: 'enceinte', english: 'pregnant', exampleFr: 'Elle est enceinte.', exampleEn: 'She is pregnant.' },
      { french: 'dispute', english: 'argument / fight', exampleFr: 'Encore une dispute.', exampleEn: 'Another argument.' },
      { french: 'mensonge', english: 'lie', exampleFr: 'C\'est un mensonge.', exampleEn: 'It\'s a lie.' },
      { french: 'secret', english: 'secret', exampleFr: 'Tu me caches un secret.', exampleEn: 'You\'re hiding a secret from me.' },
      { french: 'confiance', english: 'trust', exampleFr: 'Tu as perdu ma confiance.', exampleEn: 'You lost my trust.' },
      { french: 'pardon', english: 'sorry / forgiveness', exampleFr: 'Je te demande pardon.', exampleEn: 'I\'m asking your forgiveness.' },
      { french: 's\'excuser', english: 'to apologize', exampleFr: 'Il refuse de s\'excuser.', exampleEn: 'He refuses to apologize.' },
      { french: 'inquiet', english: 'worried', exampleFr: 'Je suis inquiet pour toi.', exampleEn: 'I\'m worried about you.' },
      { french: 'fierté', english: 'pride', exampleFr: 'C\'est une question de fierté.', exampleEn: 'It\'s a matter of pride.' },
      { french: 'honte', english: 'shame', exampleFr: 'J\'ai honte.', exampleEn: 'I\'m ashamed.' },
      { french: 'soutenir', english: 'to support', exampleFr: 'Je veux te soutenir.', exampleEn: 'I want to support you.' },
      { french: 'protéger', english: 'to protect', exampleFr: 'Je fais ça pour protéger ma famille.', exampleEn: 'I do this to protect my family.' },
      { french: 'partir', english: 'to leave', exampleFr: 'Je dois partir.', exampleEn: 'I have to leave.' },
      { french: 'rentrer', english: 'to come home', exampleFr: 'Tu rentres tard.', exampleEn: 'You come home late.' },
      { french: 'souper', english: 'supper / evening meal', exampleFr: 'On soupe à huit heures.', exampleEn: 'We eat supper at eight.' },
    ],
  },
  {
    id: 'car-wash-jobs',
    label: 'Car wash & odd jobs',
    emoji: '🚗',
    words: [
      { french: 'lavage de voiture', english: 'car wash', exampleFr: 'Il bosse au lavage de voiture.', exampleEn: 'He works at the car wash.' },
      { french: 'éponge', english: 'sponge', exampleFr: 'Prends une éponge.', exampleEn: 'Grab a sponge.' },
      { french: 'chiffon', english: 'rag / cloth', exampleFr: 'Un chiffon propre.', exampleEn: 'A clean rag.' },
      { french: 'pare-brise', english: 'windshield', exampleFr: 'Nettoie le pare-brise.', exampleEn: 'Clean the windshield.' },
      { french: 'pneu', english: 'tire', exampleFr: 'Le pneu est crevé.', exampleEn: 'The tire is flat.' },
      { french: 'moteur', english: 'engine', exampleFr: 'Le moteur fait un bruit bizarre.', exampleEn: 'The engine is making a weird noise.' },
      { french: 'plein', english: 'full tank (of gas)', exampleFr: 'Fais le plein.', exampleEn: 'Fill up the tank.' },
      { french: 'station-service', english: 'gas station', exampleFr: 'Arrête-toi à la station-service.', exampleEn: 'Stop at the gas station.' },
      { french: 'pourboire', english: 'tip (money)', exampleFr: 'Garde le pourboire.', exampleEn: 'Keep the tip.' },
      { french: 'patron', english: 'boss', exampleFr: 'Le patron veut te voir.', exampleEn: 'The boss wants to see you.' },
      { french: 'équipe', english: 'team', exampleFr: 'Bonne équipe ce soir.', exampleEn: 'Good team tonight.' },
      { french: 'pause', english: 'break', exampleFr: 'On fait une pause ?', exampleEn: 'Should we take a break?' },
      { french: 'planning', english: 'schedule', exampleFr: 'C\'est pas mon planning.', exampleEn: 'That\'s not my schedule.' },
      { french: 'corvée', english: 'chore', exampleFr: 'Encore une corvée.', exampleEn: 'Another chore.' },
      { french: 'se débrouiller', english: 'to manage / get by', exampleFr: 'On se débrouille.', exampleEn: 'We\'re managing.' },
    ],
  },
  {
    id: 'school-home-more',
    label: 'School & home (more)',
    emoji: '📚',
    words: [
      { french: 'devoirs', english: 'homework', exampleFr: 'Fais tes devoirs.', exampleEn: 'Do your homework.' },
      { french: 'cours de chimie', english: 'chemistry class', exampleFr: 'Le cours de chimie commence.', exampleEn: 'Chemistry class is starting.' },
      { french: 'tableau', english: 'board (whiteboard)', exampleFr: 'Écris ça au tableau.', exampleEn: 'Write that on the board.' },
      { french: 'craie', english: 'chalk', exampleFr: 'Prends la craie.', exampleEn: 'Take the chalk.' },
      { french: 'salle des profs', english: 'teachers\' lounge', exampleFr: 'Il est dans la salle des profs.', exampleEn: 'He\'s in the teachers\' lounge.' },
      { french: 'réunion', english: 'meeting', exampleFr: 'Réunion de parents ce soir.', exampleEn: 'Parents\' meeting tonight.' },
      { french: 'canapé', english: 'couch / sofa', exampleFr: 'Assieds-toi sur le canapé.', exampleEn: 'Sit on the couch.' },
      { french: 'télécommande', english: 'remote control', exampleFr: 'Passe-moi la télécommande.', exampleEn: 'Hand me the remote.' },
      { french: 'laver le linge', english: 'to do laundry', exampleFr: 'Je dois laver le linge.', exampleEn: 'I need to do laundry.' },
      { french: 'sèche-linge', english: 'dryer', exampleFr: 'Le sèche-linge est en panne.', exampleEn: 'The dryer is broken.' },
      { french: 'plafond', english: 'ceiling', exampleFr: 'Une tache au plafond.', exampleEn: 'A stain on the ceiling.' },
      { french: 'fuite', english: 'leak', exampleFr: 'Y a une fuite.', exampleEn: 'There\'s a leak.' },
      { french: 'réparer', english: 'to repair', exampleFr: 'Je peux réparer ça.', exampleEn: 'I can fix that.' },
      { french: 'bricoler', english: 'to DIY / tinker', exampleFr: 'Il bricole dans le garage.', exampleEn: 'He\'s tinkering in the garage.' },
      { french: 'voisin', english: 'neighbor', exampleFr: 'Le voisin s\'inquiète.', exampleEn: 'The neighbor is worried.' },
    ],
  },
];

const MORE_QUOTES = [
  { french: 'Je suis l\'homme qui a peur.', english: 'I am the man who is afraid.', speaker: 'Walt', note: 'VF introspection — slice of life' },
  { french: 'On fait ce qu\'on peut.', english: 'We do what we can.', speaker: 'Skyler', note: 'Household realism' },
  { french: 'T\'es en retard pour le dîner.', english: 'You\'re late for dinner.', speaker: 'Skyler', note: 'Family routine' },
  { french: 'Range ta chambre.', english: 'Clean your room.', speaker: 'Parents', note: 'Everyday parenting VF' },
  { french: 'J\'ai besoin d\'un peu d\'air.', english: 'I need some air.', speaker: 'Jesse', note: 'Emotional / everyday' },
];

const existingIds = new Set(data.categories.map((c) => c.id));
for (const cat of NEW_CATEGORIES) {
  if (!existingIds.has(cat.id)) data.categories.push(cat);
}

const quoteSet = new Set(data.iconicQuotes.map((q) => q.french));
for (const q of MORE_QUOTES) {
  if (!quoteSet.has(q.french)) data.iconicQuotes.push(q);
}

data.meta.subtitle = 'VF vocabulary — crime & chemistry plus the everyday slice-of-life: bills, family, car wash, school, and iconic lines.';

writeFileSync(PATH, JSON.stringify(data, null, 2));
const wordCount = data.categories.reduce((n, c) => n + c.words.length, 0);
console.log(`Breaking Bad vocab: ${data.categories.length} categories, ${wordCount} words, ${data.iconicQuotes.length} quotes`);
