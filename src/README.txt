(Ce document est une copie de la section "Présentation du code" du rapport de projet)

Pour exécuter le code, il faut ouvrir le "index.html" dans un navigateur récent (testé sous Chrome, Opéra, Firefox).

Le code se situe intégralement dans le fichier "main.js". Le fichier "worker.js" est une implémentation de la résolution sous forme de thread pour séparer la vue et les algorithmes, mais les apports n'étant pas vraiment visibles, l'idée a été abandonnée (son utilisation nécessitant l'usage d'un serveur HTTP obligatoirement).

On peut découper le code en plusieurs grandes familles de classes, visibles en partie dans le diagramme de classes.

La première famille, en rouge dans le diagramme de classe, correspond aux classes ayant un rapport avec l'interface graphique. La classe {FormController} est la porte d'entrée de l'application. Elle s'occupe des événements provenant du formulaire de paramètre. Il y a ensuite les classes préposées aux graphiques, avec {GraphDrawerD3} pour le graphe, prenant les données de la classe {Graph}, et {StatisticsDrawerD3} pour les statistiques, prenant les données de la classe {Statistics}.

La deuxième famille est la plaque tournante de l'application, avec la classe {PartitionningSolver} et sa méthode {resolve} qui récupère les paramètres pour la résolution du problème, initialise tout ce qui est nécessaire et lance la résolution. On peut lui adjoindre la classe {Graph}, qui est la représentation du graphe à résoudre en mémoire, ainsi que la classe {GraphPartition} qui s'occupe des traitements sur les partitions : voisinages, évaluations, codages. Quant à La classe {Movement}, elle gère le codage en mémoire des mouvements élémentaires (utilisé dans la méthode de recherche Tabou).

La troisième famille, en vert dans le diagramme de classe, est celle des méthodes de résolution. On y retrouve les 5 méthodes implémentées (énumération, descente de gradient, recuit simulé, recherche tabou et algorithme génétique), chacune d'elle ayant sa propre classe. Elles reposent sur la même architecture (l'héritage n'existe pas en Javascript) avec comme point d'entrée une méthode {resolve}.

La dernière famille correspond aux classes d'aide pour les différentes tâches à faire. Ainsi, la classe {Performance} permet de chronométrer précisément la durée d'une fonction, la classe {C} s'occupe de la sortie sur console, la classe {Util} regroupe des fonctions de nécessité générale par rapport au langage en lui-même (copie d'objet, génération d'entier aléatoirement...), et la classe {FileParser} lit les fichiers de graphes pour les créer dans la classe {Graph}.