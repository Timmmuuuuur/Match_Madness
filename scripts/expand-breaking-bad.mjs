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
    id: 'oral-fillers',
    label: 'Oral French & fillers',
    emoji: '💬',
    words: [
      { french: 'genre', english: 'like / kind of (filler)', context: 'very common in spoken French', exampleFr: 'C\'était genre, super bizarre.', exampleEn: 'It was like, super weird.' },
      { french: 'ben', english: 'well / uh (filler)', exampleFr: 'Ben, je sais pas.', exampleEn: 'Well, I don\'t know.' },
      { french: 'bah', english: 'well / meh (filler)', exampleFr: 'Bah, on verra.', exampleEn: 'Well, we\'ll see.' },
      { french: 'quoi', english: 'what / you know (tag)', context: 'sentence tag', exampleFr: 'C\'est pas mal, quoi.', exampleEn: 'It\'s not bad, you know.' },
      { french: 'enfin', english: 'anyway / I mean', exampleFr: 'Enfin, c\'est pas grave.', exampleEn: 'Anyway, it\'s no big deal.' },
      { french: 'bref', english: 'long story short', exampleFr: 'Bref, j\'ai dit oui.', exampleEn: 'Long story short, I said yes.' },
      { french: 'du coup', english: 'so / as a result', exampleFr: 'Du coup, on est partis.', exampleEn: 'So we left.' },
      { french: 'en fait', english: 'actually / in fact', exampleFr: 'En fait, j\'avais raison.', exampleEn: 'Actually, I was right.' },
      { french: 'bon', english: 'okay / well / right', exampleFr: 'Bon, on y va ?', exampleEn: 'Okay, shall we go?' },
      { french: 'allez', english: 'come on / go on', exampleFr: 'Allez, dis-moi la vérité.', exampleEn: 'Come on, tell me the truth.' },
      { french: 'voilà', english: 'there you go / that\'s it', exampleFr: 'Voilà, c\'est fait.', exampleEn: 'There you go, it\'s done.' },
      { french: 'tu vois', english: 'you see / you know', exampleFr: 'C\'est compliqué, tu vois.', exampleEn: 'It\'s complicated, you see.' },
      { french: 'je veux dire', english: 'I mean', exampleFr: 'C\'est cher — je veux dire, trop cher.', exampleEn: 'It\'s expensive — I mean, too expensive.' },
      { french: 'franchement', english: 'honestly / frankly', exampleFr: 'Franchement, j\'en ai marre.', exampleEn: 'Honestly, I\'m fed up.' },
      { french: 'sérieux', english: 'seriously? / for real', exampleFr: 'Sérieux ? Tu plaisantes.', exampleEn: 'Seriously? You\'re kidding.' },
    ],
  },
  {
    id: 'everyday-slang',
    label: 'Everyday slang & casual words',
    emoji: '🗣️',
    words: [
      { french: 'truc', english: 'thing / stuff', exampleFr: 'Passe-moi ce truc.', exampleEn: 'Hand me that thing.' },
      { french: 'machin', english: 'thingy / whatsit', exampleFr: 'Le machin là-bas.', exampleEn: 'That thingy over there.' },
      { french: 'boulot', english: 'work / job (casual)', exampleFr: 'Je suis crevé du boulot.', exampleEn: 'I\'m wiped out from work.' },
      { french: 'bosser', english: 'to work (casual)', exampleFr: 'Je bosse tard ce soir.', exampleEn: 'I\'m working late tonight.' },
      { french: 'crever', english: 'to be exhausted (casual)', exampleFr: 'Je crève de fatigue.', exampleEn: 'I\'m dead tired.' },
      { french: 'flemme', english: 'can\'t be bothered / laziness', exampleFr: 'J\'ai la flemme de sortir.', exampleEn: 'I can\'t be bothered to go out.' },
      { french: 'ouais', english: 'yeah (casual)', exampleFr: 'Ouais, carrément.', exampleEn: 'Yeah, totally.' },
      { french: 'nan', english: 'nope / nah', exampleFr: 'Nan, j\'y crois pas.', exampleEn: 'Nah, I don\'t believe it.' },
      { french: 'grave', english: 'totally / seriously (youth)', context: 'intensifier', exampleFr: 'C\'est grave bien.', exampleEn: 'It\'s seriously good.' },
      { french: 'carrément', english: 'totally / absolutely', exampleFr: 'C\'est carrément faux.', exampleEn: 'That\'s totally wrong.' },
      { french: 'nul', english: 'lame / rubbish', exampleFr: 'Le film était nul.', exampleEn: 'The film was rubbish.' },
      { french: 'cool', english: 'cool', exampleFr: 'C\'est cool avec toi.', exampleEn: 'It\'s cool with you.' },
      { french: 'sympa', english: 'nice / friendly', exampleFr: 'Il est super sympa.', exampleEn: 'He\'s really nice.' },
      { french: 'relou', english: 'annoying / a pain (slang)', exampleFr: 'C\'est relou ce truc.', exampleEn: 'This thing is annoying.' },
      { french: 'chelou', english: 'weird / sketchy (verlan)', exampleFr: 'Y a un mec chelou dehors.', exampleEn: 'There\'s a sketchy guy outside.' },
      { french: 'bourré', english: 'drunk (casual)', exampleFr: 'Il était bourré hier soir.', exampleEn: 'He was drunk last night.' },
      { french: 'une tournée', english: 'round (of drinks)', exampleFr: 'C\'est ma tournée.', exampleEn: 'Drinks are on me.' },
      { french: 'un pote', english: 'a mate / buddy', exampleFr: 'Je sors avec mes potes.', exampleEn: 'I\'m going out with my mates.' },
      { french: 'une nana', english: 'a girl / chick (casual)', exampleFr: 'C\'est une nana sympa.', exampleEn: 'She\'s a nice girl.' },
      { french: 'un gars', english: 'a guy', exampleFr: 'C\'est un gars bien.', exampleEn: 'He\'s a good guy.' },
    ],
  },
  {
    id: 'how-people-talk',
    label: 'How real people talk',
    emoji: '🤝',
    words: [
      { french: 't\'inquiète', english: 'don\'t worry (short)', exampleFr: 'T\'inquiète, ça va aller.', exampleEn: 'Don\'t worry, it\'ll be fine.' },
      { french: 'pas grave', english: 'no worries / no big deal', exampleFr: 'Pas grave, on rattrapera.', exampleEn: 'No big deal, we\'ll catch up.' },
      { french: 'ça marche', english: 'sounds good / deal', exampleFr: 'Demain à dix heures ? — Ça marche.', exampleEn: 'Tomorrow at ten? — Sounds good.' },
      { french: 'ça roule', english: 'all good / sure thing', exampleFr: 'On se voit ce soir ? — Ça roule.', exampleEn: 'See you tonight? — Sure thing.' },
      { french: 't\'es où', english: 'where are you (casual)', exampleFr: 'T\'es où ? J\'t\'attends.', exampleEn: 'Where are you? I\'m waiting.' },
      { french: 'j\'sais pas', english: 'I dunno', exampleFr: 'J\'sais pas quoi faire.', exampleEn: 'I dunno what to do.' },
      { french: 'j\'vais', english: 'I\'m gonna', exampleFr: 'J\'vais pas tarder.', exampleEn: 'I won\'t be long.' },
      { french: 'y\'a', english: 'there is / there are (spoken)', exampleFr: 'Y\'a personne.', exampleEn: 'There\'s nobody.' },
      { french: 'c\'est pas vrai', english: 'no way / you\'re kidding', exampleFr: 'C\'est pas vrai !', exampleEn: 'No way!' },
      { french: 't\'as raison', english: 'you\'re right', exampleFr: 'T\'as raison, faut partir.', exampleEn: 'You\'re right, we need to leave.' },
      { french: 'laisse tomber', english: 'forget it / drop it', exampleFr: 'Laisse tomber, c\'est fini.', exampleEn: 'Forget it, it\'s over.' },
      { french: 't\'en fais pas', english: 'don\'t worry about it', exampleFr: 'T\'en fais pas pour moi.', exampleEn: 'Don\'t worry about me.' },
      { french: 'on se capte', english: 'we\'ll catch up (slang)', exampleFr: 'On se capte plus tard.', exampleEn: 'We\'ll catch up later.' },
      { french: 'je te tiens au courant', english: 'I\'ll keep you posted', exampleFr: 'Je te tiens au courant.', exampleEn: 'I\'ll keep you posted.' },
      { french: 'ça te dit', english: 'fancy / up for it?', exampleFr: 'Un ciné ce soir, ça te dit ?', exampleEn: 'Fancy a movie tonight?' },
      { french: 'j\'en peux plus', english: 'I can\'t take it anymore', exampleFr: 'J\'en peux plus, là.', exampleEn: 'I can\'t take it anymore.' },
      { french: 'c\'est la honte', english: 'how embarrassing', exampleFr: 'C\'est la honte devant tout le monde.', exampleEn: 'So embarrassing in front of everyone.' },
      { french: 'trop bien', english: 'so good / awesome', exampleFr: 'C\'était trop bien !', exampleEn: 'It was awesome!' },
      { french: 'pas mal', english: 'not bad / pretty good', exampleFr: 'Pas mal, ton idée.', exampleEn: 'Not bad, your idea.' },
      { french: 'on verra bien', english: 'we\'ll see', exampleFr: 'On verra bien demain.', exampleEn: 'We\'ll see tomorrow.' },
    ],
  },
  {
    id: 'argot-street-real',
    label: 'Street & real-life argot',
    emoji: '🏙️',
    words: [
      { french: 'fric', english: 'cash / dough', exampleFr: 'J\'ai plus de fric.', exampleEn: 'I\'m out of cash.' },
      { french: 'thune', english: 'money (slang)', exampleFr: 'Ça coûte une blinde en thune.', exampleEn: 'It costs a fortune.' },
      { french: 'une blinde', english: 'a fortune / loads', exampleFr: 'Y a une blinde de monde.', exampleEn: 'There are loads of people.' },
      { french: 'se faire avoir', english: 'to get ripped off / fooled', exampleFr: 'On s\'est fait avoir.', exampleEn: 'We got ripped off.' },
      { french: 'arnaque', english: 'scam / rip-off', exampleFr: 'C\'est une arnaque.', exampleEn: 'It\'s a scam.' },
      { french: 'flic', english: 'cop (slang)', exampleFr: 'Y a les flics dans le coin.', exampleEn: 'There are cops around.' },
      { french: 'poulet', english: 'cop (slang)', exampleFr: 'Attention au poulet.', exampleEn: 'Watch out for the cops.' },
      { french: 'se barrer', english: 'to split / get out of here', exampleFr: 'Faut se barrer, vite.', exampleEn: 'We need to get out of here, fast.' },
      { french: 'se taire', english: 'to shut up', exampleFr: 'Tais-toi / ferme-la.', exampleEn: 'Shut up.' },
      { french: 'ferme-la', english: 'shut it (rude)', exampleFr: 'Ferme-la, Jesse.', exampleEn: 'Shut it, Jesse.' },
      { french: 'ta gueule', english: 'shut your mouth (very rude)', context: 'VF heated scenes', exampleFr: 'Ta gueule !', exampleEn: 'Shut your mouth!' },
      { french: 'emmerder', english: 'to annoy / bother', exampleFr: 'Arrête de m\'emmerder.', exampleEn: 'Stop bothering me.' },
      { french: 'en avoir marre', english: 'to be fed up', exampleFr: 'J\'en ai marre de mentir.', exampleEn: 'I\'m fed up with lying.' },
      { french: 'flipper', english: 'to freak out (slang)', exampleFr: 'Ça me fait flipper.', exampleEn: 'It freaks me out.' },
      { french: 'péter un câble', english: 'to lose it / snap', exampleFr: 'Il a pété un câble.', exampleEn: 'He lost it.' },
      { french: 'se prendre la tête', english: 'to stress / overthink', exampleFr: 'Arrête de te prendre la tête.', exampleEn: 'Stop stressing about it.' },
      { french: 'un type', english: 'a guy / bloke', exampleFr: 'Un type est passé hier.', exampleEn: 'Some guy came by yesterday.' },
      { french: 'un mec louche', english: 'a shady guy', exampleFr: 'Y avait un mec louche.', exampleEn: 'There was a shady guy.' },
      { french: 'planter', english: 'to ditch / stand someone up', exampleFr: 'Il m\'a planté au resto.', exampleEn: 'He stood me up at the restaurant.' },
      { french: 'se faire la malle', english: 'to do a runner / skip town', exampleFr: 'Il s\'est fait la malle.', exampleEn: 'He skipped town.' },
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
  { french: 'T\'inquiète, mec.', english: 'Don\'t worry, dude.', speaker: 'Jesse', note: 'Casual spoken VF' },
  { french: 'Du coup, on fait quoi ?', english: 'So what do we do?', speaker: 'Jesse', note: 'Everyday oral French' },
  { french: 'Franchement, j\'en ai marre.', english: 'Honestly, I\'m fed up.', speaker: 'Skyler', note: 'Real frustration register' },
  { french: 'Pas grave, on se débrouille.', english: 'No big deal, we\'ll manage.', speaker: 'Walt', note: 'Casual reassurance' },
  { french: 'Ça roule ?', english: 'All good? / You okay?', speaker: 'Jesse', note: 'Street-casual check-in' },
];

const existingIds = new Set(data.categories.map((c) => c.id));
for (const cat of NEW_CATEGORIES) {
  if (!existingIds.has(cat.id)) data.categories.push(cat);
}

const quoteSet = new Set(data.iconicQuotes.map((q) => q.french));
for (const q of MORE_QUOTES) {
  if (!quoteSet.has(q.french)) data.iconicQuotes.push(q);
}

data.meta.subtitle =
  'VF vocabulary — crime & chemistry, plus real spoken French: fillers, slang, how people actually talk, bills, family, and iconic lines.';

writeFileSync(PATH, JSON.stringify(data, null, 2));
const wordCount = data.categories.reduce((n, c) => n + c.words.length, 0);
console.log(`Breaking Bad vocab: ${data.categories.length} categories, ${wordCount} words, ${data.iconicQuotes.length} quotes`);
