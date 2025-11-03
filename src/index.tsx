import { Hono } from 'hono'
import { renderer } from './renderer'
import { createClient } from '@supabase/supabase-js'

type Bindings = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)

// Page d'accueil
app.get('/', (c) => {
  return c.render(
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>DocGen MVP - ACPM</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Plateforme de génération de lettres de mission
      </p>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <a 
          href="/clients" 
          style={{
            display: 'block',
            padding: '30px',
            background: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontSize: '20px',
            fontWeight: 'bold',
            minWidth: '200px',
            textAlign: 'center'
          }}
        >
          📋 Clients
        </a>
        
        <a 
          href="/missions" 
          style={{
            display: 'block',
            padding: '30px',
            background: '#10b981',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontSize: '20px',
            fontWeight: 'bold',
            minWidth: '200px',
            textAlign: 'center'
          }}
        >
          📄 Missions
        </a>
      </div>
    </div>
  )
})

// Page liste clients
app.get('/clients', async (c) => {
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('raison_sociale')

  if (error) {
    return c.render(
      <div style={{ padding: '40px' }}>
        <p style={{ color: 'red' }}>Erreur: {error.message}</p>
      </div>
    )
  }

  return c.render(
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px' }}>
        <a href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '16px' }}>
          ← Retour
        </a>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>
            Clients
          </h1>
          <p style={{ color: '#666' }}>
            {clients?.length || 0} client{(clients?.length || 0) > 1 ? 's' : ''}
          </p>
        </div>
        
        <a 
          href="/clients/nouveau" 
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#10b981',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          ➕ Nouveau client
        </a>
      </div>

      {!clients || clients.length === 0 ? (
        <p>Aucun client trouvé</p>
      ) : (
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Raison sociale</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Forme juridique</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>SIRET</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Ville</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client: any) => (
              <tr 
                key={client.id} 
                style={{ 
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onmouseover="this.style.background='#f9fafb'"
                onmouseout="this.style.background='white'"
                onclick={`window.location.href='/clients/${client.id}'`}
              >
                <td style={{ padding: '16px', fontWeight: '500' }}>{client.raison_sociale}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    background: '#dbeafe', 
                    color: '#1e40af',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {client.forme_juridique}
                  </span>
                </td>
                <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '14px' }}>
                  {client.siret}
                </td>
                <td style={{ padding: '16px' }}>{client.ville}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
})

// Page création client (formulaire)
app.get('/clients/nouveau', (c) => {
  return c.render(
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <a href="/clients" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '16px' }}>
          ← Retour aux clients
        </a>
      </div>

      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>
        Nouveau client
      </h1>

      <form method="POST" action="/clients/nouveau" style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Raison sociale *
          </label>
          <input 
            type="text" 
            name="raison_sociale" 
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px',
              fontSize: '16px'
            }} 
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Forme juridique *
          </label>
          <select 
            name="forme_juridique" 
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px',
              fontSize: '16px'
            }}
          >
            <option value="">Sélectionner...</option>
            <option value="SAS">SAS</option>
            <option value="SARL">SARL</option>
            <option value="SASU">SASU</option>
            <option value="EURL">EURL</option>
            <option value="SA">SA</option>
            <option value="SCI">SCI</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            SIRET * (14 chiffres)
          </label>
          <input 
            type="text" 
            name="siret" 
            required
            pattern="[0-9]{14}"
            maxlength="14"
            placeholder="94451932100011"
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px',
              fontSize: '16px',
              fontFamily: 'monospace'
            }} 
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Adresse *
          </label>
          <input 
            type="text" 
            name="adresse_ligne1" 
            required
            placeholder="4 Ecurie"
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px',
              fontSize: '16px'
            }} 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Code postal *
            </label>
            <input 
              type="text" 
              name="code_postal" 
              required
              pattern="[0-9]{5}"
              maxlength="5"
              placeholder="78660"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                fontSize: '16px'
              }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Ville *
            </label>
            <input 
              type="text" 
              name="ville" 
              required
              placeholder="ORSONVILLE"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                fontSize: '16px'
              }} 
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Siège social *
          </label>
          <input 
            type="text" 
            name="siege_adresse" 
            required
            placeholder="4 Ecurie, 78660 ORSONVILLE"
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px',
              fontSize: '16px'
            }} 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Civilité dirigeant *
            </label>
            <select 
              name="dirigeant_civilite" 
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                fontSize: '16px'
              }}
            >
              <option value="">Sélectionner...</option>
              <option value="M.">M.</option>
              <option value="Mme">Mme</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Fonction dirigeant *
            </label>
            <input 
              type="text" 
              name="dirigeant_fonction" 
              required
              placeholder="président(e), gérant(e)..."
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                fontSize: '16px'
              }} 
            />
          </div>
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <a 
            href="/clients" 
            style={{
              padding: '12px 24px',
              background: '#e5e7eb',
              color: '#374151',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Annuler
          </a>
          <button 
            type="submit"
            style={{
              padding: '12px 24px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Créer le client
          </button>
        </div>
      </form>
    </div>
  )
})

// Traitement de la création client (POST)
app.post('/clients/nouveau', async (c) => {
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  // Récupérer les données du formulaire
  const formData = await c.req.parseBody()
  
  // Trouver l'ID du cabinet ACPM
  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('id')
    .eq('nom', 'ACPM')
    .single()

  if (!cabinet) {
    return c.render(
      <div style={{ padding: '40px' }}>
        <p style={{ color: 'red' }}>Erreur: Cabinet ACPM non trouvé</p>
      </div>
    )
  }

  // Créer le nouveau client
  const { error } = await supabase
    .from('clients')
    .insert({
      cabinet_id: cabinet.id,
      raison_sociale: formData.raison_sociale,
      forme_juridique: formData.forme_juridique,
      siret: formData.siret,
      adresse_ligne1: formData.adresse_ligne1,
      code_postal: formData.code_postal,
      ville: formData.ville,
      siege_adresse: formData.siege_adresse,
      dirigeant_civilite: formData.dirigeant_civilite,
      dirigeant_fonction: formData.dirigeant_fonction
    })

  if (error) {
    return c.render(
      <div style={{ padding: '40px' }}>
        <p style={{ color: 'red' }}>Erreur lors de la création: {error.message}</p>
        <a href="/clients/nouveau" style={{ color: '#3b82f6' }}>← Retour au formulaire</a>
      </div>
    )
  }

  // Redirection vers la liste des clients
  return c.redirect('/clients')
})

// Page détail client
app.get('/clients/:id', async (c) => {
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const clientId = c.req.param('id')

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (error || !client) {
    return c.render(
      <div style={{ padding: '40px' }}>
        <p style={{ color: 'red' }}>Client non trouvé</p>
        <a href="/clients" style={{ color: '#3b82f6' }}>← Retour aux clients</a>
      </div>
    )
  }

  return c.render(
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <a href="/clients" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '16px' }}>
          ← Retour aux clients
        </a>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', margin: '0' }}>
          {client.raison_sociale}
        </h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <a 
            href={`/clients/${client.id}/modifier`}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ✏️ Modifier
          </a>
          <button
            onclick={`if(confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) { window.location.href='/clients/${client.id}/supprimer' }`}
            style={{
              padding: '10px 20px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#374151' }}>
          Informations générales
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
              Forme juridique
            </label>
            <p style={{ fontSize: '16px', fontWeight: '500', margin: '0' }}>
              <span style={{ 
                background: '#dbeafe', 
                color: '#1e40af',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {client.forme_juridique}
              </span>
            </p>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
              SIRET
            </label>
            <p style={{ fontSize: '16px', fontWeight: '500', margin: '0', fontFamily: 'monospace' }}>
              {client.siret}
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#374151', marginTop: '30px' }}>
          Adresse
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
              Rue
            </label>
            <p style={{ fontSize: '16px', margin: '0' }}>
              {client.adresse_ligne1}
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
                Code postal
              </label>
              <p style={{ fontSize: '16px', margin: '0' }}>
                {client.code_postal}
              </p>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
                Ville
              </label>
              <p style={{ fontSize: '16px', margin: '0' }}>
                {client.ville}
              </p>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
              Siège social
            </label>
            <p style={{ fontSize: '16px', margin: '0' }}>
              {client.siege_adresse}
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#374151', marginTop: '30px' }}>
          Dirigeant
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
              Civilité
            </label>
            <p style={{ fontSize: '16px', margin: '0' }}>
              {client.dirigeant_civilite || '-'}
            </p>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>
              Fonction
            </label>
            <p style={{ fontSize: '16px', margin: '0' }}>
              {client.dirigeant_fonction || '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

// Page modification client (formulaire pré-rempli)
app.get('/clients/:id/modifier', async (c) => {
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const clientId = c.req.param('id')

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (error || !client) {
    return c.render(
      <div style={{ padding: '40px' }}>
        <p style={{ color: 'red' }}>Client non trouvé</p>
        <a href="/clients" style={{ color: '#3b82f6' }}>← Retour aux clients</a>
      </div>
    )
  }

  return c.render(
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <a href={`/clients/${client.id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '16px' }}>
          ← Retour à la fiche client
        </a>
      </div>

      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>
        Modifier {client.raison_sociale}
      </h1>

      <form method="POST" action={`/clients/${client.id}/modifier`} style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Raison sociale *
          </label>
          <input 
            type="text" 
            name="raison_sociale" 
            value={client.raison_sociale}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px',
              fontSize: '16px'
            }} 
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Forme juridique *
          </label>
          <select 
            name="forme_juridique" 
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px',
              fontSize: '16px'
            }}
          >
            <option value="SAS" selected={client.forme_juridique === 'SAS'}>SAS</option>
            <option value="SARL" selected={client.forme_juridique === 'SARL'}>SARL</option>
            <option value="SASU" selected={client.forme_juridique === 'SASU'}>SASU</option>
            <option value="EURL" selected={client.forme_juridique === 'EURL'}>EURL</option>
            <option value="SA" selected={client.forme_juridique === 'SA'}>SA</option>
            <option value="SCI" selected={client.forme_juridique === 'SCI'}>SCI</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            SIRET * (14 chiffres)
          </label>
          <input 
            type="text" 
            name="siret" 
            value={client.siret}
            required
            pattern="[0-9]{14}"
            maxlength="14"
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px',
              fontSize: '16px',
              fontFamily: 'monospace'
            }} 
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Adresse *
          </label>
          <input 
            type="text" 
            name="adresse_ligne1" 
            value={client.adresse_ligne1}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px',
              fontSize: '16px'
            }} 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Code postal *
            </label>
            <input 
              type="text" 
              name="code_postal" 
              value={client.code_postal}
              required
              pattern="[0-9]{5}"
              maxlength="5"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                fontSize: '16px'
              }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Ville *
            </label>
            <input 
              type="text" 
              name="ville" 
              value={client.ville}
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                fontSize: '16px'
              }} 
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Siège social *
          </label>
          <input 
            type="text" 
            name="siege_adresse" 
            value={client.siege_adresse}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px',
              fontSize: '16px'
            }} 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Civilité dirigeant *
            </label>
            <select 
              name="dirigeant_civilite" 
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                fontSize: '16px'
              }}
            >
              <option value="M." selected={client.dirigeant_civilite === 'M.'}>M.</option>
              <option value="Mme" selected={client.dirigeant_civilite === 'Mme'}>Mme</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Fonction dirigeant *
            </label>
            <input 
              type="text" 
              name="dirigeant_fonction" 
              value={client.dirigeant_fonction || ''}
              required
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                fontSize: '16px'
              }} 
            />
          </div>
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <a 
            href={`/clients/${client.id}`}
            style={{
              padding: '12px 24px',
              background: '#e5e7eb',
              color: '#374151',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Annuler
          </a>
          <button 
            type="submit"
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  )
})

// Traitement de la modification client (POST)
app.post('/clients/:id/modifier', async (c) => {
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const clientId = c.req.param('id')
  const formData = await c.req.parseBody()

  const { error } = await supabase
    .from('clients')
    .update({
      raison_sociale: formData.raison_sociale,
      forme_juridique: formData.forme_juridique,
      siret: formData.siret,
      adresse_ligne1: formData.adresse_ligne1,
      code_postal: formData.code_postal,
      ville: formData.ville,
      siege_adresse: formData.siege_adresse,
      dirigeant_civilite: formData.dirigeant_civilite,
      dirigeant_fonction: formData.dirigeant_fonction
    })
    .eq('id', clientId)

  if (error) {
    return c.render(
      <div style={{ padding: '40px' }}>
        <p style={{ color: 'red' }}>Erreur lors de la modification: {error.message}</p>
        <a href={`/clients/${clientId}/modifier`} style={{ color: '#3b82f6' }}>← Retour au formulaire</a>
      </div>
    )
  }

  // Redirection vers la page détail du client
  return c.redirect(`/clients/${clientId}`)
})

// Suppression d'un client
app.get('/clients/:id/supprimer', async (c) => {
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const clientId = c.req.param('id')

  // Vérifier que le client existe avant de supprimer
  const { data: client } = await supabase
    .from('clients')
    .select('raison_sociale')
    .eq('id', clientId)
    .single()

  if (!client) {
    return c.render(
      <div style={{ padding: '40px' }}>
        <p style={{ color: 'red' }}>Client non trouvé</p>
        <a href="/clients" style={{ color: '#3b82f6' }}>← Retour aux clients</a>
      </div>
    )
  }

  // Supprimer le client
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (error) {
    return c.render(
      <div style={{ padding: '40px' }}>
        <p style={{ color: 'red' }}>Erreur lors de la suppression: {error.message}</p>
        <a href={`/clients/${clientId}`} style={{ color: '#3b82f6' }}>← Retour à la fiche client</a>
      </div>
    )
  }

  // Redirection vers la liste des clients
  return c.redirect('/clients')
})

// ==================== MISSIONS ====================

// Page liste missions
app.get('/missions', async (c) => {
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  // Récupérer toutes les missions avec les infos du client
  const { data: missions, error } = await supabase
    .from('missions')
    .select(`
      *,
      clients (
        raison_sociale,
        forme_juridique
      )
    `)

  if (error) {
    return c.render(
      <div style={{ padding: '40px' }}>
        <p style={{ color: 'red' }}>Erreur: {error.message}</p>
      </div>
    )
  }

  return c.render(
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px' }}>
        <a href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '16px' }}>
          ← Retour
        </a>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>
            Missions
          </h1>
          <p style={{ color: '#666' }}>
            {missions?.length || 0} mission{(missions?.length || 0) > 1 ? 's' : ''}
          </p>
        </div>
        
        <a 
          href="/missions/nouvelle" 
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#10b981',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          ➕ Nouvelle mission
        </a>
      </div>

      {!missions || missions.length === 0 ? (
        <div style={{ 
          background: 'white', 
          padding: '60px', 
          borderRadius: '12px', 
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '20px' }}>
            Aucune mission pour le moment
          </p>
          <a 
            href="/missions/nouvelle"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#10b981',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Créer la première mission
          </a>
        </div>
      ) : (
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          background: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Client</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Type</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Période</th>
              <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>Honoraires HT</th>
              <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {missions.map((mission: any) => {
              const dateDebut = new Date(mission.date_debut_mission).toLocaleDateString('fr-FR')
              const dateFin = new Date(mission.date_fin_mission).toLocaleDateString('fr-FR')
              
              return (
                <tr 
                  key={mission.id}
                  style={{ 
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onmouseover="this.style.background='#f9fafb'"
                  onmouseout="this.style.background='white'"
                  onclick={`window.location.href='/missions/${mission.id}'`}
                >
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: '500' }}>{mission.clients?.raison_sociale}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>{mission.clients?.forme_juridique}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      background: mission.type_mission === 'Première mission' ? '#dbeafe' : '#fef3c7',
                      color: mission.type_mission === 'Première mission' ? '#1e40af' : '#92400e',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {mission.type_mission}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>
                    {dateDebut} → {dateFin}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: '500', fontFamily: 'monospace' }}>
                    {mission.honoraires_annuels ? `${mission.honoraires_annuels.toLocaleString('fr-FR')} €` : '-'}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ 
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      Active
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
})

// Page création mission (formulaire)
app.get('/missions/nouvelle', async (c) => {
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  // Récupérer la liste des clients pour le dropdown
  const { data: clients } = await supabase
    .from('clients')
    .select('id, raison_sociale, forme_juridique')
    .order('raison_sociale')

  // Récupérer le catalogue des prestations pour les checkboxes
  const { data: prestations } = await supabase
    .from('prestations_catalogue')
    .select('*')
    .order('ordre')

  return c.render(
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <a href="/missions" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '16px' }}>
          ← Retour aux missions
        </a>
      </div>

      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>
        Nouvelle mission
      </h1>

      <form method="POST" action="/missions/nouvelle" style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        
        {/* Sélection du client */}
        <div style={{ marginBottom: '30px', paddingBottom: '30px', borderBottom: '2px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#374151' }}>Client</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Sélectionner le client *
            </label>
            <select 
              name="client_id" 
              required
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                fontSize: '16px'
              }}
            >
              <option value="">Choisir un client...</option>
              {clients?.map((client: any) => (
                <option key={client.id} value={client.id}>
                  {client.raison_sociale} ({client.forme_juridique})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Type de mission */}
        <div style={{ marginBottom: '30px', paddingBottom: '30px', borderBottom: '2px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#374151' }}>Type de mission</h2>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="type_mission" 
                value="Première mission"
                required
                style={{ marginRight: '8px', width: '20px', height: '20px' }}
              />
              <span style={{ fontSize: '16px' }}>Première mission</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="type_mission" 
                value="Renouvellement"
                style={{ marginRight: '8px', width: '20px', height: '20px' }}
              />
              <span style={{ fontSize: '16px' }}>Renouvellement</span>
            </label>
          </div>
        </div>

        {/* Période et honoraires */}
        <div style={{ marginBottom: '30px', paddingBottom: '30px', borderBottom: '2px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#374151' }}>Période et honoraires</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Début de l'exercice *
              </label>
              <input 
                type="date" 
                name="exercice_debut" 
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px',
                  fontSize: '16px'
                }} 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Fin de l'exercice *
              </label>
              <input 
                type="date" 
                name="exercice_fin" 
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px',
                  fontSize: '16px'
                }} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Honoraires annuels HT (€) *
            </label>
            <input 
              type="number" 
              name="honoraires_ht" 
              required
              min="0"
              step="0.01"
              placeholder="5000.00"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px',
                fontSize: '16px',
                fontFamily: 'monospace'
              }} 
            />
          </div>
        </div>

        {/* Prestations */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#374151' }}>
            Prestations comprises dans la mission *
          </h2>
          
          <p style={{ color: '#6b7280', marginBottom: '15px', fontSize: '14px' }}>
            Sélectionnez au moins une prestation
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {prestations?.map((prestation: any) => (
              <label 
                key={prestation.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onmouseover="this.style.background='#f9fafb'; this.style.borderColor='#3b82f6'"
                onmouseout="this.style.background='white'; this.style.borderColor='#e5e7eb'"
              >
                <input 
                  type="checkbox" 
                  name="prestations" 
                  value={prestation.id}
                  style={{ marginRight: '12px', marginTop: '4px', width: '18px', height: '18px' }}
                />
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {prestation.nom}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Catégorie: {prestation.categorie}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Boutons */}
        <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <a 
            href="/missions" 
            style={{
              padding: '12px 24px',
              background: '#e5e7eb',
              color: '#374151',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Annuler
          </a>
          <button 
            type="submit"
            style={{
              padding: '12px 24px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Créer la mission
          </button>
        </div>
      </form>
    </div>
  )
})

// Traitement de la création mission (POST)
app.post('/missions/nouvelle', async (c) => {
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const formData = await c.req.parseBody()
  
  // Calculer les honoraires TTC (TVA 20%)
  const honorairesHT = parseFloat(formData.honoraires_ht as string)
  const honorairesTTC = honorairesHT * 1.20

  // 1. Créer la mission
  const { data: mission, error: missionError } = await supabase
    .from('missions')
    .insert({
      client_id: formData.client_id,
      type_mission: formData.type_mission,
      date_debut_mission: formData.exercice_debut,
      date_fin_mission: formData.exercice_fin,
      honoraires_annuels: honorairesHT,
      honoraires_ttc: honorairesTTC
    })
    .select()
    .single()

  if (missionError) {
    return c.render(
      <div style={{ padding: '40px' }}>
        <p style={{ color: 'red' }}>Erreur lors de la création: {missionError.message}</p>
        <a href="/missions/nouvelle" style={{ color: '#3b82f6' }}>← Retour au formulaire</a>
      </div>
    )
  }

  // 2. Récupérer les prestations sélectionnées
  // formData.prestations peut être une string ou un array
  let prestationsIds: string[] = []
  if (formData.prestations) {
    if (Array.isArray(formData.prestations)) {
      prestationsIds = formData.prestations as string[]
    } else {
      prestationsIds = [formData.prestations as string]
    }
  }

  // 3. Créer les liens missions_prestations
  if (prestationsIds.length > 0) {
    const prestationsLinks = prestationsIds.map(prestationId => ({
      mission_id: mission.id,
      prestation_id: prestationId
    }))

    const { error: prestationsError } = await supabase
      .from('missions_prestations')
      .insert(prestationsLinks)

    if (prestationsError) {
      return c.render(
        <div style={{ padding: '40px' }}>
          <p style={{ color: 'red' }}>Mission créée mais erreur prestations: {prestationsError.message}</p>
          <a href={`/missions/${mission.id}`} style={{ color: '#3b82f6' }}>Voir la mission</a>
        </div>
      )
    }
  }

  // Redirection vers la liste des missions
  return c.redirect('/missions')
})

export default app
