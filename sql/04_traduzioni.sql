-- 04_traduzioni.sql — traduzioni EN/FR/DE del menu iniziale (02_seed_menu.sql).
-- Aggiorna solo le voci ancora senza traduzioni: non sovrascrive quelle modificate dall'admin.

UPDATE drinkin.categorie c SET i18n = v.i18n::jsonb FROM (VALUES
  ('Tavola Calda – Pasta', '{"en": {"nome": "Hot Dishes – Pasta"}, "fr": {"nome": "Plats chauds – Pâtes"}, "de": {"nome": "Warme Küche – Pasta"}}'),
  ('Tavola Calda – Insalate e Secondi', '{"en": {"nome": "Hot Dishes – Salads & Mains"}, "fr": {"nome": "Plats chauds – Salades et plats"}, "de": {"nome": "Warme Küche – Salate & Hauptgerichte"}}'),
  ('Pizza', '{"en": {"nome": "Pizza"}, "fr": {"nome": "Pizzas"}, "de": {"nome": "Pizza"}}'),
  ('Panini', '{"en": {"nome": "Sandwiches"}, "fr": {"nome": "Sandwichs"}, "de": {"nome": "Belegte Brötchen"}}'),
  ('Piadine', '{"en": {"nome": "Piadina Flatbreads"}, "fr": {"nome": "Piadines"}, "de": {"nome": "Piadina-Fladenbrote"}}'),
  ('Snack e Dolci', '{"en": {"nome": "Snacks & Sweets"}, "fr": {"nome": "Snacks et douceurs"}, "de": {"nome": "Snacks & Süßes"}}'),
  ('Caffetteria', '{"en": {"nome": "Coffee & Hot Drinks"}, "fr": {"nome": "Cafés et boissons chaudes"}, "de": {"nome": "Kaffee & Heißgetränke"}}')
) AS v(nome, i18n) WHERE c.nome = v.nome AND c.i18n = '{}'::jsonb;

UPDATE drinkin.prodotti p SET i18n = v.i18n::jsonb FROM (VALUES
  ('Tavola Calda – Pasta', 'Bolognese', NULL, '{"en": {"nome": "Pasta Bolognese"}, "fr": {"nome": "Pâtes à la bolognaise"}, "de": {"nome": "Pasta Bolognese"}}'),
  ('Tavola Calda – Pasta', 'Pesto', NULL, '{"en": {"nome": "Pasta with Pesto"}, "fr": {"nome": "Pâtes au pesto"}, "de": {"nome": "Pasta mit Pesto"}}'),
  ('Tavola Calda – Pasta', 'Arrabbiata', NULL, '{"en": {"nome": "Pasta all''Arrabbiata (spicy tomato)"}, "fr": {"nome": "Pâtes all''arrabbiata (sauce tomate pimentée)"}, "de": {"nome": "Pasta all''Arrabbiata (scharfe Tomatensoße)"}}'),
  ('Tavola Calda – Pasta', 'Pomodoro', NULL, '{"en": {"nome": "Pasta with Tomato Sauce"}, "fr": {"nome": "Pâtes à la sauce tomate"}, "de": {"nome": "Pasta mit Tomatensoße"}}'),
  ('Tavola Calda – Pasta', 'Gnocchi o Trofie al Pesto', NULL, '{"en": {"nome": "Gnocchi or Trofie with Pesto"}, "fr": {"nome": "Gnocchis ou trofie au pesto"}, "de": {"nome": "Gnocchi oder Trofie mit Pesto"}}'),
  ('Tavola Calda – Pasta', 'Ravioli Burro e Salvia', NULL, '{"en": {"nome": "Ravioli with Butter and Sage"}, "fr": {"nome": "Raviolis au beurre et à la sauge"}, "de": {"nome": "Ravioli mit Butter und Salbei"}}'),
  ('Tavola Calda – Pasta', 'Pansotti al Sugo di Noci', NULL, '{"en": {"nome": "Pansotti with Walnut Sauce"}, "fr": {"nome": "Pansotti à la sauce aux noix"}, "de": {"nome": "Pansotti mit Walnusssoße"}}'),
  ('Tavola Calda – Insalate e Secondi', 'Insalata Mista', NULL, '{"en": {"nome": "Mixed Salad"}, "fr": {"nome": "Salade composée"}, "de": {"nome": "Gemischter Salat"}}'),
  ('Tavola Calda – Insalate e Secondi', 'Bresaola, Rucola e Grana', NULL, '{"en": {"nome": "Bresaola, Rocket and Parmesan"}, "fr": {"nome": "Bresaola, roquette et parmesan"}, "de": {"nome": "Bresaola, Rucola und Parmesan"}}'),
  ('Tavola Calda – Insalate e Secondi', 'Carpaccio di Tonno con Rucola e Pomodorini', NULL, '{"en": {"nome": "Tuna Carpaccio with Rocket and Cherry Tomatoes"}, "fr": {"nome": "Carpaccio de thon, roquette et tomates cerises"}, "de": {"nome": "Thunfisch-Carpaccio mit Rucola und Kirschtomaten"}}'),
  ('Tavola Calda – Insalate e Secondi', 'Roast Beef e Patate', NULL, '{"en": {"nome": "Roast Beef with Potatoes"}, "fr": {"nome": "Rosbif et pommes de terre"}, "de": {"nome": "Roastbeef mit Kartoffeln"}}'),
  ('Pizza', 'Marinara', NULL, '{"en": {"nome": "Marinara", "descrizione": "Tomato, garlic, oregano"}, "fr": {"nome": "Marinara", "descrizione": "Tomate, ail, origan"}, "de": {"nome": "Marinara", "descrizione": "Tomate, Knoblauch, Oregano"}}'),
  ('Pizza', 'Margherita', NULL, '{"en": {"nome": "Margherita", "descrizione": "Tomato, mozzarella"}, "fr": {"nome": "Margherita", "descrizione": "Tomate, mozzarella"}, "de": {"nome": "Margherita", "descrizione": "Tomate, Mozzarella"}}'),
  ('Pizza', 'Bufala', NULL, '{"en": {"nome": "Bufala", "descrizione": "Tomato, cherry tomatoes, buffalo mozzarella"}, "fr": {"nome": "Bufala", "descrizione": "Tomate, tomates cerises, mozzarella di bufala"}, "de": {"nome": "Bufala", "descrizione": "Tomate, Kirschtomaten, Büffelmozzarella"}}'),
  ('Pizza', 'Prosciutto', NULL, '{"en": {"nome": "Ham", "descrizione": "Tomato, cooked ham, mozzarella"}, "fr": {"nome": "Jambon", "descrizione": "Tomate, jambon cuit, mozzarella"}, "de": {"nome": "Schinken", "descrizione": "Tomate, Kochschinken, Mozzarella"}}'),
  ('Pizza', 'Diavola', NULL, '{"en": {"nome": "Diavola", "descrizione": "Tomato, spicy salami, mozzarella"}, "fr": {"nome": "Diavola", "descrizione": "Tomate, salami piquant, mozzarella"}, "de": {"nome": "Diavola", "descrizione": "Tomate, scharfe Salami, Mozzarella"}}'),
  ('Pizza', 'Wurstel', NULL, '{"en": {"nome": "Frankfurter", "descrizione": "Tomato, frankfurters, mozzarella"}, "fr": {"nome": "Saucisses", "descrizione": "Tomate, saucisses de Francfort, mozzarella"}, "de": {"nome": "Würstchen", "descrizione": "Tomate, Würstchen, Mozzarella"}}'),
  ('Pizza', '4 Formaggi', NULL, '{"en": {"nome": "Four Cheeses", "descrizione": "Mozzarella, fontina, stracchino, gorgonzola"}, "fr": {"nome": "Quatre fromages", "descrizione": "Mozzarella, fontina, stracchino, gorgonzola"}, "de": {"nome": "Vier Käse", "descrizione": "Mozzarella, Fontina, Stracchino, Gorgonzola"}}'),
  ('Pizza', 'Romana', NULL, '{"en": {"nome": "Romana", "descrizione": "Tomato, olives, capers, anchovies, mozzarella"}, "fr": {"nome": "Romaine", "descrizione": "Tomate, olives, câpres, anchois, mozzarella"}, "de": {"nome": "Romana", "descrizione": "Tomate, Oliven, Kapern, Sardellen, Mozzarella"}}'),
  ('Pizza', 'Pesto', NULL, '{"en": {"nome": "Pesto", "descrizione": "Pesto, mozzarella"}, "fr": {"nome": "Pesto", "descrizione": "Pesto, mozzarella"}, "de": {"nome": "Pesto", "descrizione": "Pesto, Mozzarella"}}'),
  ('Pizza', 'Tonno e Cipolle', NULL, '{"en": {"nome": "Tuna and Onion", "descrizione": "Tomato, tuna, onions, mozzarella"}, "fr": {"nome": "Thon et oignons", "descrizione": "Tomate, thon, oignons, mozzarella"}, "de": {"nome": "Thunfisch und Zwiebeln", "descrizione": "Tomate, Thunfisch, Zwiebeln, Mozzarella"}}'),
  ('Pizza', 'Vegetariana', NULL, '{"en": {"nome": "Vegetarian", "descrizione": "Tomato, grilled vegetables, mozzarella"}, "fr": {"nome": "Végétarienne", "descrizione": "Tomate, légumes grillés, mozzarella"}, "de": {"nome": "Vegetarisch", "descrizione": "Tomate, gegrilltes Gemüse, Mozzarella"}}'),
  ('Pizza', 'Salsiccia', NULL, '{"en": {"nome": "Italian Sausage", "descrizione": "Tomato, sausage, onions, gorgonzola, mozzarella"}, "fr": {"nome": "Saucisse italienne", "descrizione": "Tomate, saucisse, oignons, gorgonzola, mozzarella"}, "de": {"nome": "Salsiccia", "descrizione": "Tomate, italienische Bratwurst, Zwiebeln, Gorgonzola, Mozzarella"}}'),
  ('Pizza', 'Speck', NULL, '{"en": {"nome": "Speck", "descrizione": "Cream, mozzarella, speck"}, "fr": {"nome": "Speck", "descrizione": "Crème, mozzarella, speck"}, "de": {"nome": "Speck", "descrizione": "Sahne, Mozzarella, Speck"}}'),
  ('Pizza', 'Capricciosa', NULL, '{"en": {"nome": "Capricciosa", "descrizione": "Tomato, mushrooms, artichokes, cooked ham, mozzarella"}, "fr": {"nome": "Capricciosa", "descrizione": "Tomate, champignons, artichauts, jambon cuit, mozzarella"}, "de": {"nome": "Capricciosa", "descrizione": "Tomate, Champignons, Artischocken, Kochschinken, Mozzarella"}}'),
  ('Panini', 'Cotto e Formaggio', NULL, '{"en": {"nome": "Ham and Cheese"}, "fr": {"nome": "Jambon et fromage"}, "de": {"nome": "Schinken und Käse"}}'),
  ('Panini', 'Salame e Formaggio', NULL, '{"en": {"nome": "Salami and Cheese"}, "fr": {"nome": "Salami et fromage"}, "de": {"nome": "Salami und Käse"}}'),
  ('Panini', 'Pomodoro e Mozzarella', NULL, '{"en": {"nome": "Tomato and Mozzarella"}, "fr": {"nome": "Tomate et mozzarella"}, "de": {"nome": "Tomate und Mozzarella"}}'),
  ('Panini', 'Crudo e Mozzarella', NULL, '{"en": {"nome": "Prosciutto and Mozzarella"}, "fr": {"nome": "Jambon cru et mozzarella"}, "de": {"nome": "Rohschinken und Mozzarella"}}'),
  ('Piadine', 'Cotto e Mozzarella', NULL, '{"en": {"nome": "Ham and Mozzarella"}, "fr": {"nome": "Jambon et mozzarella"}, "de": {"nome": "Schinken und Mozzarella"}}'),
  ('Piadine', 'Crudo, Stracchino e Rucola', NULL, '{"en": {"nome": "Prosciutto, Stracchino and Rocket"}, "fr": {"nome": "Jambon cru, stracchino et roquette"}, "de": {"nome": "Rohschinken, Stracchino und Rucola"}}'),
  ('Piadine', 'Cotto, Pomodoro e Mozzarella', NULL, '{"en": {"nome": "Ham, Tomato and Mozzarella"}, "fr": {"nome": "Jambon, tomate et mozzarella"}, "de": {"nome": "Schinken, Tomate und Mozzarella"}}'),
  ('Piadine', 'Vegetariana', NULL, '{"en": {"nome": "Vegetarian", "descrizione": "Grilled vegetables and cheese"}, "fr": {"nome": "Végétarienne", "descrizione": "Légumes grillés et fromage"}, "de": {"nome": "Vegetarisch", "descrizione": "Gegrilltes Gemüse und Käse"}}'),
  ('Piadine', 'Speck e Brie', NULL, '{"en": {"nome": "Speck and Brie"}, "fr": {"nome": "Speck et brie"}, "de": {"nome": "Speck und Brie"}}'),
  ('Snack e Dolci', 'Brioches', NULL, '{"en": {"nome": "Croissants", "descrizione": "Jam, chocolate, custard or plain"}, "fr": {"nome": "Croissants", "descrizione": "Confiture, chocolat, crème pâtissière ou nature"}, "de": {"nome": "Hörnchen", "descrizione": "Marmelade, Schokolade, Vanillecreme oder natur"}}'),
  ('Snack e Dolci', 'Focaccia liscia', NULL, '{"en": {"nome": "Plain Focaccia"}, "fr": {"nome": "Focaccia nature"}, "de": {"nome": "Focaccia natur"}}'),
  ('Snack e Dolci', 'Focaccia farcita piccola', NULL, '{"en": {"nome": "Small Filled Focaccia"}, "fr": {"nome": "Petite focaccia garnie"}, "de": {"nome": "Kleine belegte Focaccia"}}'),
  ('Snack e Dolci', 'Pizza trancio', NULL, '{"en": {"nome": "Slice of Pizza"}, "fr": {"nome": "Part de pizza"}, "de": {"nome": "Pizzastück"}}'),
  ('Snack e Dolci', 'Toast', NULL, '{"en": {"nome": "Ham and Cheese Toastie"}, "fr": {"nome": "Croque-monsieur"}, "de": {"nome": "Schinken-Käse-Toast"}}'),
  ('Snack e Dolci', 'Focaccia farcita', NULL, '{"en": {"nome": "Filled Focaccia"}, "fr": {"nome": "Focaccia garnie"}, "de": {"nome": "Belegte Focaccia"}}'),
  ('Caffetteria', 'Caffè espresso', NULL, '{"en": {"nome": "Espresso"}, "fr": {"nome": "Expresso"}, "de": {"nome": "Espresso"}}'),
  ('Caffetteria', 'Caffè americano', NULL, '{"en": {"nome": "Americano"}, "fr": {"nome": "Café allongé"}, "de": {"nome": "Caffè Americano"}}'),
  ('Caffetteria', 'Caffè decaffeinato', NULL, '{"en": {"nome": "Decaf Espresso"}, "fr": {"nome": "Café décaféiné"}, "de": {"nome": "Entkoffeinierter Espresso"}}'),
  ('Caffetteria', 'Caffè d''orzo', 'Piccolo', '{"en": {"nome": "Barley Coffee", "variante": "Small"}, "fr": {"nome": "Café d''orge", "variante": "Petit"}, "de": {"nome": "Gerstenkaffee", "variante": "Klein"}}'),
  ('Caffetteria', 'Caffè d''orzo', 'Grande', '{"en": {"nome": "Barley Coffee", "variante": "Large"}, "fr": {"nome": "Café d''orge", "variante": "Grand"}, "de": {"nome": "Gerstenkaffee", "variante": "Groß"}}'),
  ('Caffetteria', 'Caffè al ginseng', 'Piccolo', '{"en": {"nome": "Ginseng Coffee", "variante": "Small"}, "fr": {"nome": "Café au ginseng", "variante": "Petit"}, "de": {"nome": "Ginseng-Kaffee", "variante": "Klein"}}'),
  ('Caffetteria', 'Caffè al ginseng', 'Grande', '{"en": {"nome": "Ginseng Coffee", "variante": "Large"}, "fr": {"nome": "Café au ginseng", "variante": "Grand"}, "de": {"nome": "Ginseng-Kaffee", "variante": "Groß"}}'),
  ('Caffetteria', 'Caffè corretto', NULL, '{"en": {"nome": "Espresso with a Dash of Liqueur"}, "fr": {"nome": "Café arrosé (avec liqueur)"}, "de": {"nome": "Espresso mit Schuss"}}'),
  ('Caffetteria', 'Cappuccino', NULL, '{"en": {"nome": "Cappuccino"}, "fr": {"nome": "Cappuccino"}, "de": {"nome": "Cappuccino"}}'),
  ('Caffetteria', 'Latte macchiato', NULL, '{"en": {"nome": "Latte Macchiato"}, "fr": {"nome": "Latte macchiato"}, "de": {"nome": "Latte macchiato"}}'),
  ('Caffetteria', 'Marocchino', NULL, '{"en": {"nome": "Marocchino", "descrizione": "Espresso, cocoa and milk foam"}, "fr": {"nome": "Marocchino", "descrizione": "Expresso, cacao et mousse de lait"}, "de": {"nome": "Marocchino", "descrizione": "Espresso, Kakao und Milchschaum"}}'),
  ('Caffetteria', 'Latte bianco', NULL, '{"en": {"nome": "Glass of Milk"}, "fr": {"nome": "Verre de lait"}, "de": {"nome": "Glas Milch"}}'),
  ('Caffetteria', 'Tè e tisane', NULL, '{"en": {"nome": "Tea and Herbal Teas"}, "fr": {"nome": "Thé et tisanes"}, "de": {"nome": "Tee und Kräutertees"}}'),
  ('Caffetteria', 'Cioccolata calda', NULL, '{"en": {"nome": "Hot Chocolate"}, "fr": {"nome": "Chocolat chaud"}, "de": {"nome": "Heiße Schokolade"}}')
) AS v(categoria, nome, variante, i18n)
JOIN drinkin.categorie c ON c.nome = v.categoria
WHERE p.categoria_id = c.id AND p.nome = v.nome AND p.variante IS NOT DISTINCT FROM v.variante AND p.i18n = '{}'::jsonb;

UPDATE drinkin.impostazioni SET i18n = '{"en": {"nota_piede": "* Frozen product. For allergen information, please ask our staff."}, "fr": {"nota_piede": "* Produit surgelé. Pour toute information sur les allergènes, adressez-vous au personnel."}, "de": {"nota_piede": "* Tiefkühlprodukt. Informationen zu Allergenen erhalten Sie beim Personal."}}'::jsonb WHERE id = 1 AND i18n = '{}'::jsonb;
