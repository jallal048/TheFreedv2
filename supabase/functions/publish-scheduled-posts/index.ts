Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Configuración de Supabase faltante');
        }

        const now = new Date().toISOString();

        // Obtener posts programados que deben publicarse
        const scheduledResponse = await fetch(`${supabaseUrl}/rest/v1/scheduled_posts?status=eq.pending&scheduled_for=lte.${now}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!scheduledResponse.ok) {
            const errorText = await scheduledResponse.text();
            throw new Error(`Error al obtener posts programados: ${errorText}`);
        }

        const scheduledPosts = await scheduledResponse.json();
        const publishedPosts = [];
        const errors = [];

        // Publicar cada post
        for (const post of scheduledPosts) {
            try {
                // Actualizar el status del contenido a "published"
                const updateContentResponse = await fetch(`${supabaseUrl}/rest/v1/contents?id=eq.${post.content_id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        status: 'published',
                        updated_at: new Date().toISOString()
                    })
                });

                if (!updateContentResponse.ok) {
                    throw new Error(`Error al actualizar contenido ${post.content_id}`);
                }

                // Actualizar el status del scheduled_post a "published"
                const updateScheduledResponse = await fetch(`${supabaseUrl}/rest/v1/scheduled_posts?id=eq.${post.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: 'published',
                        published_at: new Date().toISOString()
                    })
                });

                if (!updateScheduledResponse.ok) {
                    throw new Error(`Error al actualizar scheduled_post ${post.id}`);
                }

                publishedPosts.push({
                    content_id: post.content_id,
                    scheduled_post_id: post.id
                });
            } catch (error) {
                errors.push({
                    content_id: post.content_id,
                    error: error.message
                });

                // Marcar como fallido
                await fetch(`${supabaseUrl}/rest/v1/scheduled_posts?id=eq.${post.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: 'failed',
                        error_message: error.message
                    })
                });
            }
        }

        return new Response(JSON.stringify({
            data: {
                total_scheduled: scheduledPosts.length,
                published: publishedPosts.length,
                failed: errors.length,
                published_posts: publishedPosts,
                errors: errors
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error en publish-scheduled-posts:', error);

        const errorResponse = {
            error: {
                code: 'PUBLISH_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
