/**
 * Rebuilds shared/data/reading-articles.json with longer texts, richer vocab, new articles.
 * Run: node scripts/build-reading-articles.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATH = join(__dirname, '../shared/data/reading-articles.json');

const v = (fr, en) => ({ fr, en });

/** Extra paragraphs + vocab to merge into existing articles by id. */
const PATCHES = {
  1: {
    paragraphs: [
      {
        french:
          "Avant de monter, Sophie fait une pause devant le Trocadéro pour prendre des photos. Des musiciens de rue jouent du jazz ; elle leur laisse quelques pièces et continue son chemin. Sur le pont, des vendeurs proposent des crêpes et des souvenirs — elle achète une petite tour en métal pour sa sœur.",
        english:
          "Before going up, Sophie pauses at the Trocadéro to take photos. Street musicians play jazz; she leaves them a few coins and continues on her way. On the bridge, vendors offer crêpes and souvenirs — she buys a small metal tower for her sister.",
      },
      {
        french:
          "Le lendemain, elle visite le musée d'Orsay. Les impressionnistes l'émerveillent, surtout les toiles de Monet. Elle note dans son carnet les mots nouveaux qu'elle entend : « magnifique », « éblouissant », « inoubliable ». Son séjour parisien lui donne envie d'améliorer son français.",
        english:
          "The next day, she visits the Musée d'Orsay. The Impressionists amaze her, especially Monet's paintings. She writes new words she hears in her notebook: \"magnificent\", \"dazzling\", \"unforgettable\". Her Paris trip makes her want to improve her French.",
      },
    ],
    vocab: [
      v('se réveiller', 'to wake up'),
      v('les toits', 'the rooftops'),
      v('impressionnant', 'impressive'),
      v('un billet', 'a ticket'),
      v('le deuxième étage', 'the second floor'),
      v('la vue', 'the view'),
      v('au loin', 'in the distance'),
      v('s\'installer', 'to settle in'),
      v('un café crème', 'coffee with milk'),
      v('un carnet', 'a notebook'),
      v('épuisé(e)', 'exhausted'),
      v('des musiciens de rue', 'street musicians'),
      v('émerveiller', 'to amaze'),
      v('inoubliable', 'unforgettable'),
    ],
  },
  2: {
    paragraphs: [
      {
        french:
          "Une jeune mère choisit des tomates cerises et demande au maraîcher : « Elles sont bien mûres ? » Il lui en fait goûter une et elle hoche la tête. À côté, un étudiant négocie le prix d'un panier de pommes — une tradition presque rituelle entre habitués et commerçants.",
        english:
          "A young mother picks cherry tomatoes and asks the greengrocer: \"Are they ripe enough?\" He lets her taste one and she nods. Nearby, a student negotiates the price of a basket of apples — an almost ritual tradition between regulars and traders.",
      },
      {
        french:
          "Vers onze heures, l'odeur du pain chaud attire les passants. Le boulanger crie : « Baguettes encore chaudes ! » Les gens font la queue avec patience. Le marché, c'est aussi ça : du bruit, des couleurs, et des conversations entre voisins qui ne se voient qu'une fois par semaine.",
        english:
          "Around eleven o'clock, the smell of warm bread draws passers-by. The baker calls out: \"Baguettes still warm!\" People queue patiently. The market is also about noise, colours, and conversations between neighbours who only see each other once a week.",
      },
    ],
    vocab: [
      v('un étal', 'a market stall'),
      v('un commerçant', 'a trader / shopkeeper'),
      v('un fromager', 'a cheesemaker'),
      v('affiné(e)', 'aged (cheese)'),
      v('déçu(e)', 'disappointed'),
      v('un maraîcher', 'a greengrocer'),
      v('mûr(e)', 'ripe'),
      v('négocier', 'to negotiate'),
      v('un habitué', 'a regular customer'),
      v('faire la queue', 'to queue / stand in line'),
      v('ranger', 'to pack up'),
      v('hebdomadaire', 'weekly'),
      v('un rituel', 'a ritual'),
    ],
  },
  3: {
    paragraphs: [
      {
        french:
          "Le professeur principal explique les règles du collège : respect, ponctualité, et travail en groupe. Léa prend des notes mais son esprit vagabonde — elle pense déjà au club de théâtre qui commence mercredi. À la récréation, les élèves sortent dans la cour ; on entend des rires et des ballons qui rebondissent.",
        english:
          "The head teacher explains the college rules: respect, punctuality, and group work. Léa takes notes but her mind wanders — she is already thinking about the drama club that starts on Wednesday. At break time, pupils go out into the playground; you hear laughter and balls bouncing.",
      },
      {
        french:
          "Le soir, sa mère prépare le goûter pendant que Léa range son cartable. « Alors, la rentrée ? » demande-t-elle. Léa répond : « Ça va. J'ai une copine sympa. » Sa mère sourit : « Pas mal pour un premier jour. »",
        english:
          "In the evening, her mother prepares an afternoon snack while Léa unpacks her school bag. \"So, how was the first day back?\" she asks. Léa replies: \"It's okay. I have a nice friend.\" Her mother smiles: \"Not bad for a first day.\"",
      },
    ],
    vocab: [
      v('la rentrée', 'start of school year'),
      v('un cartable', 'school bag'),
      v('le collège', 'secondary school (11–15)'),
      v('le professeur principal', 'head teacher'),
      v('la récréation', 'break time'),
      v('la cour', 'playground'),
      v('une copine', 'a friend (girl)'),
      v('se rendre compte', 'to realise'),
      v('nerveux / nerveuse', 'nervous'),
      v('à la fois', 'both / at the same time'),
      v('le goûter', 'afternoon snack'),
      v('pas mal', 'not bad / pretty good'),
    ],
  },
  4: {
    paragraphs: [
      {
        french:
          "En attendant le médecin, Thomas lit un vieux magazine. Une infirmière lui demande son poids et sa taille, puis le pèse. « Quarante-deux kilos de moins qu'avant », pense-t-il en souriant faiblement. Le cabinet est calme ; on n'entend que le tic-tac d'une horloge.",
        english:
          "While waiting for the doctor, Thomas reads an old magazine. A nurse asks his weight and height, then weighs him. \"Forty-two kilos less than before,\" he thinks with a weak smile. The office is quiet; you only hear a clock ticking.",
      },
      {
        french:
          "De retour à la maison, il se repose sur le canapé sous une couverture. Sa femme lui prépare une soupe et lui rappelle de boire de l'eau. « Tu vas guérir », dit-elle. Thomas acquiesce, reconnaissant d'avoir quelqu'un qui s'occupe de lui.",
        english:
          "Back home, he rests on the sofa under a blanket. His wife makes him soup and reminds him to drink water. \"You'll get better,\" she says. Thomas nods, grateful to have someone looking after him.",
      },
    ],
    vocab: [
      v('un rendez-vous', 'an appointment'),
      v('la fièvre', 'fever'),
      v('mal à la gorge', 'sore throat'),
      v('tousser', 'to cough'),
      v('un symptôme', 'a symptom'),
      v('une angine', 'tonsillitis'),
      v('une ordonnance', 'a prescription'),
      v('un comprimé', 'a tablet'),
      v('une infirmière', 'a nurse'),
      v('guérir', 'to recover / heal'),
      v('se reposer', 'to rest'),
      v('s\'occuper de', 'to look after'),
    ],
  },
  5: {
    paragraphs: [
      {
        french:
          "Le deuxième jour, Mme Dubois loue un vélo et longe la Promenade des Anglais. Le vent marin lui rafraîchit le visage. Elle s'arrête pour une glace au citron et observe les familles sur la plage. « C'est exactement les vacances dont j'avais besoin », se dit-elle.",
        english:
          "On the second day, Mrs Dubois rents a bike and rides along the Promenade des Anglais. The sea breeze refreshes her face. She stops for a lemon ice cream and watches families on the beach. \"This is exactly the holiday I needed,\" she tells herself.",
      },
      {
        french:
          "Avant de partir, elle laisse un pourboire au serveur et remercie le réceptionniste pour son accueil chaleureux. Dans le taxi vers l'aéroport, elle regarde une dernière fois la mer. Elle promet de revenir l'année prochaine — peut-être avec sa fille.",
        english:
          "Before leaving, she leaves a tip for the waiter and thanks the receptionist for the warm welcome. In the taxi to the airport, she looks at the sea one last time. She promises to come back next year — perhaps with her daughter.",
      },
    ],
    vocab: [
      v('une réservation', 'a reservation'),
      v('la réception', 'reception desk'),
      v('le petit-déjeuner', 'breakfast'),
      v('une valise', 'a suitcase'),
      v('la climatisation', 'air conditioning'),
      v('la vieille ville', 'the old town'),
      v('un pourboire', 'a tip'),
      v('l\'accueil', 'welcome / reception'),
      v('la Promenade des Anglais', 'Promenade des Anglais (Nice)'),
      v('une glace', 'an ice cream'),
      v('chaleureux / chaleureuse', 'warm (welcome)'),
    ],
  },
  6: {
    paragraphs: [
      {
        french:
          "La veille de l'entretien, Karim répète ses réponses devant le miroir. Il prépare aussi des questions à poser : horaires, formation continue, ambiance d'équipe. « Montre que tu es motivé », lui a dit son ami. Il dort mal, l'estomac noué.",
        english:
          "The day before the interview, Karim practises his answers in front of the mirror. He also prepares questions to ask: hours, ongoing training, team atmosphere. \"Show that you're motivated,\" his friend told him. He sleeps poorly, stomach in knots.",
      },
      {
        french:
          "Quand le téléphone sonne vendredi après-midi, Karim hésite avant de répondre. C'est la responsable RH : « Nous sommes ravis de vous offrir le poste. » Il reste muet une seconde, puis remercie avec enthousiasme. Il raccroche et appelle sa mère immédiatement.",
        english:
          "When the phone rings on Friday afternoon, Karim hesitates before answering. It is the HR manager: \"We are delighted to offer you the position.\" He is silent for a second, then thanks her enthusiastically. He hangs up and calls his mother immediately.",
      },
    ],
    vocab: [
      v('un entretien d\'embauche', 'a job interview'),
      v('postuler', 'to apply (for a job)'),
      v('une lettre de motivation', 'a cover letter'),
      v('les ressources humaines', 'human resources'),
      v('ponctuel', 'punctual'),
      v('une PME', 'an SME (small business)'),
      v('maîtriser', 'to master / be proficient in'),
      v('la concurrence', 'competition'),
      v('motivé(e)', 'motivated'),
      v('une formation', 'training'),
      v('l\'ambiance', 'atmosphere'),
      v('être ravi(e)', 'to be delighted'),
    ],
  },
  7: {
    paragraphs: [
      {
        french:
          "Un après-midi, la grand-mère apprend à Camille une recette de kouign-amann. La pâte colle aux doigts et tout le monde rit. Lucas, lui, pêche à la ligne avec son grand-père au port ; ils n'attrapent pas grand-chose, mais le silence et le bruit des vagues suffisent.",
        english:
          "One afternoon, the grandmother teaches Camille a kouign-amann recipe. The dough sticks to their fingers and everyone laughs. Lucas, meanwhile, fishes with his grandfather at the harbour; they do not catch much, but the silence and the sound of the waves are enough.",
      },
      {
        french:
          "Le dernier soir, toute la famille se promène sur la plage au coucher du soleil. Les enfants courent après les vagues. Leur grand-père dit : « La Bretagne, c'est pas le soleil toute l'année, mais c'est chez nous. » Lucas et Camille comprennent qu'ils emporteront ce souvenir longtemps.",
        english:
          "On the last evening, the whole family walks on the beach at sunset. The children run after the waves. Their grandfather says: \"Brittany doesn't have sun all year, but it's home.\" Lucas and Camille understand they will carry this memory for a long time.",
      },
    ],
    vocab: [
      v('les grandes vacances', 'summer holidays'),
      v('une galette de blé noir', 'buckwheat crêpe'),
      v('s\'écouler', 'to pass (time)'),
      v('longer', 'to run alongside'),
      v('se souvenir de', 'to remember'),
      v('une recette', 'a recipe'),
      v('le port', 'the harbour'),
      v('le coucher du soleil', 'sunset'),
      v('une vague', 'a wave'),
      v('un souvenir', 'a memory'),
      v('la côte', 'the coast'),
      v('fraîchement', 'freshly'),
    ],
  },
  8: {
    paragraphs: [
      {
        french:
          "Un samedi matin, une étudiante commande un croissant et un « grand crème ». Elle révise ses notes pour un examen de sociologie. René lui apporte le café sans qu'elle commande : « Comme d'habitude, mademoiselle ? » Elle sourit — ici, on est reconnu.",
        english:
          "On a Saturday morning, a student orders a croissant and a \"large coffee with milk\". She reviews her notes for a sociology exam. René brings her coffee without her ordering: \"As usual, miss?\" She smiles — here, you are recognised.",
      },
      {
        french:
          "Le café accueille aussi des télétravailleurs avec leurs ordinateurs. Le wifi est lent mais l'ambiance est calme. René dit souvent : « Un café, c'est un deuxième salon pour ceux qui n'ont pas de bureau à la maison. » Cette phrase résume bien le rôle social du lieu.",
        english:
          "The café also welcomes remote workers with their laptops. The wifi is slow but the atmosphere is calm. René often says: \"A café is a second living room for those who don't have an office at home.\" This sentence sums up the social role of the place well.",
      },
    ],
    vocab: [
      v('un habitué', 'a regular customer'),
      v('un petit noir', 'an espresso'),
      v('disparaître', 'to disappear'),
      v('le lien social', 'social connection'),
      v('un retraité', 'a retiree'),
      v('le quartier', 'the neighbourhood'),
      v('comme d\'habitude', 'as usual'),
      v('télétravailler', 'to work remotely'),
      v('l\'ambiance', 'atmosphere'),
      v('un salon', 'a living room'),
      v('le plat du jour', 'daily special'),
      v('un arrondissement', 'district (Paris)'),
    ],
  },
};

const NEW_ARTICLES = [
  {
    id: 9,
    title: 'Mon nouveau quartier',
    subtitle: 'My New Neighbourhood',
    level: 'A1–A2',
    topic: 'Housing & Daily Life',
    source: 'FLE reader — beginner narrative (A1+)',
    paragraphs: [
      {
        french:
          "Je m'appelle Amir. J'habite à Lyon depuis un mois. Avant, je vivais à Marseille avec ma famille. Maintenant, j'ai un petit studio près de la gare Part-Dieu. La chambre est petite, mais il y a une grande fenêtre et beaucoup de lumière.",
        english:
          "My name is Amir. I have lived in Lyon for a month. Before, I lived in Marseille with my family. Now I have a small studio near Part-Dieu station. The room is small, but there is a big window and lots of light.",
      },
      {
        french:
          "Le matin, je vais à la boulangerie en bas de l'immeuble. Le boulanger me dit toujours « Bonjour ! » avec le sourire. J'achète une baguette et parfois un pain au chocolat. Ensuite, je prends le métro pour aller à mes cours de français.",
        english:
          "In the morning, I go to the bakery downstairs in my building. The baker always says \"Hello!\" with a smile. I buy a baguette and sometimes a pain au chocolat. Then I take the metro to my French classes.",
      },
      {
        french:
          "Le soir, je fais une promenade dans le quartier. Il y a un parc, un supermarché et un café sympa. Des jeunes jouent au foot ; des familles poussent des poussettes. Je ne connais pas encore beaucoup de monde, mais je me sens déjà un peu chez moi.",
        english:
          "In the evening, I take a walk in the neighbourhood. There is a park, a supermarket, and a nice café. Young people play football; families push strollers. I do not know many people yet, but I already feel a little at home.",
      },
      {
        french:
          "Samedi, mon voisin Mohamed m'invite pour un thé. Il est d'Algérie, comme ma mère. On parle en français et parfois en arabe. « Bienvenue dans l'immeuble », dit-il. Je suis content d'avoir un ami dans le quartier.",
        english:
          "On Saturday, my neighbour Mohamed invites me for tea. He is from Algeria, like my mother. We speak in French and sometimes in Arabic. \"Welcome to the building,\" he says. I am happy to have a friend in the neighbourhood.",
      },
    ],
    vocab: [
      v('un studio', 'a studio flat'),
      v('en bas de', 'downstairs / at the bottom of'),
      v('un immeuble', 'an apartment building'),
      v('une baguette', 'a baguette'),
      v('une promenade', 'a walk'),
      v('un quartier', 'a neighbourhood'),
      v('une poussette', 'a stroller'),
      v('se sentir chez soi', 'to feel at home'),
      v('un voisin', 'a neighbour'),
      v('bienvenue', 'welcome'),
    ],
  },
  {
    id: 10,
    title: 'Soirée entre potes',
    subtitle: 'An Evening with Friends',
    level: 'A2',
    topic: 'Casual Speech & Social Life',
    source: 'FLE reader — oral French unit (A2)',
    paragraphs: [
      {
        french:
          "Ce soir, Julie retrouve ses potes au café Le Zinc, dans le 20e arrondissement. Ils ont réservé une table pour huit personnes. « Salut les gars ! » dit Julie en entrant. Tout le monde répond « Coucou ! » et on s'embrasse sur la joue — c'est la coutume ici.",
        english:
          "Tonight, Julie meets her mates at Café Le Zinc, in the 20th arrondissement. They booked a table for eight. \"Hey guys!\" says Julie as she walks in. Everyone replies \"Hey!\" and they kiss on the cheek — that's the custom here.",
      },
      {
        french:
          "Ils commandent des planches à partager : charcuterie, fromage, olives. Thomas demande : « Ça te dit un verre de vin rouge ? » Julie répond : « Carrément, j'en ai besoin après ma journée. » Le serveur passe ; on dit « S'il te plaît » et « Merci » — mais entre amis, le ton reste décontracté.",
        english:
          "They order sharing boards: cold cuts, cheese, olives. Thomas asks: \"Fancy a glass of red wine?\" Julie replies: \"Totally, I need one after my day.\" The waiter comes by; they say \"Please\" and \"Thanks\" — but among friends, the tone stays relaxed.",
      },
      {
        french:
          "La conversation va vite : boulot, films, ragots. « Franchement, mon chef me rend fou », dit Marc. « Bah, laisse tomber », répond Julie. « T'inquiète, on est là. » On rit beaucoup. C'est ça, une vraie soirée entre amis : pas besoin de mots compliqués, juste d'être ensemble.",
        english:
          "The conversation moves fast: work, films, gossip. \"Honestly, my boss is driving me crazy,\" says Marc. \"Well, forget it,\" Julie replies. \"Don't worry, we're here.\" They laugh a lot. That's a real evening with friends: no need for complicated words, just being together.",
      },
      {
        french:
          "Vers minuit, ils se séparent devant le métro. « On se capte la semaine prochaine ? » demande Thomas. « Ouais, ça roule », dit Julie. Elle rentre à pied, le cœur léger. Demain sera chargé, mais ce soir était parfait.",
        english:
          "Around midnight, they part outside the metro. \"Shall we catch up next week?\" asks Thomas. \"Yeah, sure thing,\" says Julie. She walks home, light-hearted. Tomorrow will be busy, but tonight was perfect.",
      },
      {
        french:
          "En montant les escaliers, elle envoie un message au groupe : « Merci pour ce soir, les amis ❤️ ». Les réponses arrivent aussitôt : « Trop bien », « Bisous », « À bientôt ». Julie sourit. Apprendre le français, c'est aussi apprendre à vivre comme les Français — entre deux verres et beaucoup de rires.",
        english:
          "Going up the stairs, she sends a message to the group chat: \"Thanks for tonight, friends ❤️\". Replies arrive straight away: \"So good\", \"Kisses\", \"See you soon\". Julie smiles. Learning French is also learning to live like the French — between drinks and lots of laughter.",
      },
    ],
    vocab: [
      v('un pote', 'a mate / buddy'),
      v('les gars', 'guys'),
      v('décontracté', 'relaxed / casual'),
      v('ça te dit', 'fancy / up for it?'),
      v('carrément', 'totally / absolutely'),
      v('franchement', 'honestly'),
      v('laisse tomber', 'forget it'),
      v('t\'inquiète', 'don\'t worry'),
      v('on se capte', 'we\'ll catch up'),
      v('ça roule', 'sure thing / all good'),
      v('ouais', 'yeah'),
      v('trop bien', 'awesome / so good'),
      v('à bientôt', 'see you soon'),
    ],
  },
  {
    id: 11,
    title: 'Chercher un appartement',
    subtitle: 'Looking for a Flat',
    level: 'B1',
    topic: 'Housing & Bureaucracy',
    source: 'FLE reader — housing unit (B1, Édito)',
    paragraphs: [
      {
        french:
          "Depuis trois semaines, Élodie cherche un appartement à Bordeaux. Les loyers sont élevés et les annonces disparaissent en quelques heures. Elle consulte des sites en ligne chaque matin avant le travail et envoie des messages : « Bonjour, je suis intéressée par votre annonce. Est-il encore disponible ? »",
        english:
          "For three weeks, Élodie has been looking for a flat in Bordeaux. Rents are high and listings disappear within hours. She checks websites every morning before work and sends messages: \"Hello, I am interested in your listing. Is it still available?\"",
      },
      {
        french:
          "Samedi, elle visite un T2 dans le quartier Saint-Michel. Le propriétaire, un homme poli mais pressé, lui fait visiter les pièces : un salon lumineux, une cuisine équipée, une chambre avec placard. « Le chauffage est inclus dans les charges », précise-t-il. Élodie prend des notes et des photos discrètement.",
        english:
          "On Saturday, she visits a two-room flat in the Saint-Michel neighbourhood. The landlord, a polite but hurried man, shows her around: a bright living room, a fitted kitchen, a bedroom with a wardrobe. \"Heating is included in the service charges,\" he specifies. Élodie takes notes and photos discreetly.",
      },
      {
        french:
          "Pour louer, il lui faut un dossier complet : pièce d'identité, trois derniers bulletins de salaire, contrat de travail, avis d'imposition, et parfois un garant. « C'est la galère », soupire-t-elle à sa colocataire. Pourtant, elle ne baisse pas les bras : chaque refus la rapproche du bon logement.",
        english:
          "To rent, she needs a complete file: ID, last three payslips, employment contract, tax notice, and sometimes a guarantor. \"It's a nightmare,\" she sighs to her flatmate. Still, she does not give up: each rejection brings her closer to the right place.",
      },
      {
        french:
          "Le mardi suivant, une agence l'appelle pour un appartement près du tram. Le loyer est un peu au-dessus de son budget, mais le quartier est calme et proche de son bureau. Elle signe le bail pour un an, émue et soulagée. Enfin, elle pourra « poser ses valises ».",
        english:
          "The following Tuesday, an agency calls her about a flat near the tram. The rent is slightly above her budget, but the neighbourhood is quiet and close to her office. She signs the lease for one year, moved and relieved. At last, she can \"unpack her bags\".",
      },
      {
        french:
          "Le jour de l'emménagement, ses amis l'aident à monter les cartons. Ils commandent une pizza et bricolent l'étagère du salon. « Bienvenue chez toi », dit son ami Karim en levant un verre. Élodie regarde autour d'elle : ce n'est pas grand, mais c'est le sien. Une nouvelle page commence.",
        english:
          "On moving day, her friends help carry the boxes upstairs. They order pizza and assemble the living-room shelf. \"Welcome to your place,\" says her friend Karim, raising a glass. Élodie looks around: it is not big, but it is hers. A new chapter begins.",
      },
    ],
    vocab: [
      v('un loyer', 'rent'),
      v('une annonce', 'a listing / ad'),
      v('un propriétaire', 'a landlord'),
      v('les charges', 'service charges'),
      v('un dossier', 'a file / application'),
      v('un garant', 'a guarantor'),
      v('c\'est la galère', 'it\'s a nightmare / struggle'),
      v('un bail', 'a lease'),
      v('poser ses valises', 'to settle in'),
      v('l\'emménagement', 'moving in'),
      v('équipé(e)', 'fitted / equipped'),
      v('soulagé(e)', 'relieved'),
    ],
  },
  {
    id: 12,
    title: 'Une grève des transports',
    subtitle: 'A Transport Strike',
    level: 'B1–B2',
    topic: 'News & Society',
    source: 'FLE reader — current affairs unit (B1+)',
    paragraphs: [
      {
        french:
          "Ce matin, la radio annonce une grève nationale des transports : métro, bus et RER perturbés « jusqu'à nouvel ordre ». Claire, qui habite en banlieue parisienne, écoute la nouvelle avec inquiétude. Elle doit être à une réunion importante à neuf heures au centre de Paris.",
        english:
          "This morning, the radio announces a national transport strike: metro, buses and RER disrupted \"until further notice\". Claire, who lives in the Paris suburbs, listens to the news with concern. She must be at an important meeting at nine o'clock in central Paris.",
      },
      {
        french:
          "Elle consulte l'application RATP : seulement deux lignes de métro sur seize fonctionnent normalement. « Super », murmure-t-elle ironiquement. Elle enfile ses baskets, prend son vélo et part plus tôt que d'habitude. Sur le périphérique cyclable, des centaines d'autres cyclistes ont eu la même idée.",
        english:
          "She checks the RATP app: only two metro lines out of sixteen are running normally. \"Great,\" she mutters ironically. She puts on her trainers, takes her bike and leaves earlier than usual. On the ring-road cycle path, hundreds of other cyclists had the same idea.",
      },
      {
        french:
          "À la réunion, ses collègues échangent leurs histoires : quelqu'un a marché une heure, une autre a télétravaillé depuis un café. Le directeur reconnaît la situation : « On comprend que tout le monde n'a pas pu arriver à l'heure. » La grève n'est pas seulement un problème logistique — c'est un débat politique sur les salaires et les conditions de travail.",
        english:
          "At the meeting, colleagues swap stories: someone walked for an hour, another worked remotely from a café. The director acknowledges the situation: \"We understand that not everyone could arrive on time.\" The strike is not only a logistical problem — it is a political debate about wages and working conditions.",
      },
      {
        french:
          "Le soir, Claire rentre épuisée. À la télévision, un journaliste interviewe des usagers et des syndicalistes. Les opinions sont partagées : certains soutiennent le mouvement, d'autres déplorent les désagréments. Claire, elle, réfléchit au sens du mot « solidarité » — un mot qu'elle entend souvent, mais qui prend vie les jours de grève.",
        english:
          "In the evening, Claire returns home exhausted. On television, a journalist interviews passengers and union representatives. Opinions are divided: some support the movement, others deplore the inconvenience. Claire reflects on the meaning of the word \"solidarity\" — a word she often hears, but which comes alive on strike days.",
      },
      {
        french:
          "Le lendemain, la grève continue. Claire décide de partager sa voiture avec une collègue du même quartier. Elles économisent du temps et discutent du prix de l'essence. « Au moins, on fait quelque chose de concret », dit sa collègue. Parfois, une crise oblige à inventer de nouvelles habitudes.",
        english:
          "The next day, the strike continues. Claire decides to car-share with a colleague from the same neighbourhood. They save time and discuss the price of petrol. \"At least we're doing something concrete,\" says her colleague. Sometimes a crisis forces you to invent new habits.",
      },
      {
        french:
          "Le vendredi, le trafic reprend progressivement. Claire retrouve son métro habituel, mais elle garde en tête l'image de la ville transformée : plus de vélos, plus de marcheurs, plus de conversations improvisées entre inconnus. Une grève dérange — et parfois, elle rappelle à chacun à quel point les transports structurent nos vies.",
        english:
          "On Friday, traffic gradually returns to normal. Claire gets her usual metro back, but she keeps in mind the image of a transformed city: more bikes, more walkers, more improvised conversations between strangers. A strike disrupts — and sometimes it reminds everyone how much transport structures our lives.",
      },
    ],
    vocab: [
      v('une grève', 'a strike'),
      v('perturbé(e)', 'disrupted'),
      v('jusqu\'à nouvel ordre', 'until further notice'),
      v('en banlieue', 'in the suburbs'),
      v('ironiquement', 'ironically'),
      v('un cycliste', 'a cyclist'),
      v('télétravailler', 'to work remotely'),
      v('un syndicaliste', 'a union representative'),
      v('la solidarité', 'solidarity'),
      v('un désagrément', 'an inconvenience'),
      v('le covoiturage', 'car-sharing'),
      v('progressivement', 'gradually'),
    ],
  },
  {
    id: 13,
    title: 'Lettres de Bretagne',
    subtitle: 'Letters from Brittany',
    level: 'B2',
    topic: 'Literary Narrative',
    source: 'FLE reader — advanced narrative (B2)',
    paragraphs: [
      {
        french:
          "Ma grand-mère Yvonne m'écrit encore des lettres, à la main, sur du papier bleu pâle. Elle a quatre-vingt-six ans et refuse l'ordinateur. « Internet, c'est pour les jeunes », dit-elle en riant au téléphone. Pourtant, ses lettres voyagent plus loin que beaucoup de messages numériques : je les garde dans une boîte en bois, comme des trésors.",
        english:
          "My grandmother Yvonne still writes me letters, by hand, on pale blue paper. She is eighty-six and refuses computers. \"The internet is for young people,\" she says, laughing on the phone. Yet her letters travel further than many digital messages: I keep them in a wooden box, like treasures.",
      },
      {
        french:
          "Dans sa dernière lettre, elle décrit l'automne breton : la pluie fine qui dure des journées entières, le vent qui fait claquer les volets, l'odeur de la terre humide. Elle écrit : « La mer était grise hier, mais magnifique quand même. J'ai pensé à toi en regardant les goélands. » Ces phrases simples me manquent quand je suis loin.",
        english:
          "In her latest letter, she describes the Breton autumn: fine rain that lasts whole days, wind that rattles the shutters, the smell of damp earth. She writes: \"The sea was grey yesterday, but magnificent all the same. I thought of you watching the seagulls.\" I miss these simple sentences when I am far away.",
      },
      {
        french:
          "Elle me raconte aussi le village : la boulangerie a changé de propriétaire, le maire veut rénover la mairie, les pêcheurs se plaignent des quotas. Rien d'extraordinaire — et pourtant, en lisant, j'ai l'impression d'être assis à sa table de cuisine, avec une tasse de thé et le radiateur qui grésille.",
        english:
          "She also tells me about the village: the bakery has changed owners, the mayor wants to renovate the town hall, fishermen complain about quotas. Nothing extraordinary — and yet, reading, I feel as if I am sitting at her kitchen table, with a cup of tea and the radiator crackling.",
      },
      {
        french:
          "Parfois, elle glisse une photo en noir et blanc : elle jeune, devant l'église du village ; mon grand-père, disparu depuis longtemps, qui sourit timidement. « Ne l'oublie pas », écrit-elle au dos. La mémoire familiale passe ainsi de main en main, sans likes ni notifications.",
        english:
          "Sometimes she slips in a black-and-white photo: her young, in front of the village church; my grandfather, gone long ago, smiling shyly. \"Don't forget him,\" she writes on the back. Family memory passes from hand to hand like this, without likes or notifications.",
      },
      {
        french:
          "Je lui réponds par une carte postale — Paris, la Seine, une vue banale — et quelques lignes rapides. « J'arrive pour Noël. Prépare les crêpes. » Elle ne répond pas tout de suite ; elle attendra d'avoir le temps de bien choisir ses mots. Cette lenteur, aujourd'hui, me semble précieuse.",
        english:
          "I reply with a postcard — Paris, the Seine, a banal view — and a few quick lines. \"I'm coming for Christmas. Make crêpes.\" She does not reply straight away; she will wait until she has time to choose her words well. This slowness, today, seems precious to me.",
      },
      {
        french:
          "Quand j'arrive en gare de Quimper, elle m'attend sur le quai, le foulard noué sous le menton. Elle me serre dans ses bras sans dire grand-chose. Sur le chemin de la maison, elle me parle du jardin, du chat voisin, du prix du beurre. Ce sont ces détails ordinaires qui constituent, je crois, le vrai sens du mot « chez soi ».",
        english:
          "When I arrive at Quimper station, she waits for me on the platform, scarf tied under her chin. She hugs me without saying much. On the way home, she tells me about the garden, the neighbour's cat, the price of butter. It is these ordinary details that make up, I believe, the true meaning of the word \"home\".",
      },
    ],
    vocab: [
      v('à la main', 'by hand'),
      v('un trésor', 'a treasure'),
      v('claquer', 'to slam / rattle'),
      v('un goéland', 'a seagull'),
      v('rénover', 'to renovate'),
      v('un quota', 'a quota'),
      v('grésiller', 'to crackle (radiator)'),
      v('timidement', 'shyly'),
      v('la mémoire familiale', 'family memory'),
      v('une carte postale', 'a postcard'),
      v('précieux / précieuse', 'precious'),
      v('le quai', 'the platform'),
      v('chez soi', 'home / at home'),
    ],
  },
];

function mergeArticle(article) {
  const patch = PATCHES[article.id];
  if (!patch) return article;
  return {
    ...article,
    paragraphs: [...article.paragraphs, ...patch.paragraphs],
    vocab: patch.vocab,
  };
}

const base = JSON.parse(readFileSync(PATH, 'utf8'));
const merged = base.articles.map(mergeArticle);
const existingIds = new Set(merged.map((a) => a.id));
const newOnes = NEW_ARTICLES.filter((a) => !existingIds.has(a.id));

const output = {
  meta: {
    title: 'Reading',
    subtitle:
      'Graded texts from A1 to B2 with English side by side — hover or tap highlighted words for pronunciation. Themes from standard FLE courses.',
    sourceNote: 'Pedagogical reader-style texts; aligned with DELF A2/B1 syllabus topics.',
  },
  articles: [...merged, ...newOnes],
};

writeFileSync(PATH, JSON.stringify(output, null, 2));
const paraCount = output.articles.reduce((n, a) => n + a.paragraphs.length, 0);
const vocabCount = output.articles.reduce((n, a) => n + a.vocab.length, 0);
console.log(
  `Reading: ${output.articles.length} articles, ${paraCount} paragraphs, ${vocabCount} vocab entries`,
);
