package org.harpacrista.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.text.Html;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Random;

public class HinoDiaWidget extends AppWidgetProvider {

    private static final int ID_MAXIMO_NACIONAL = 632;
    private static final String CAMINHO_JSON = "public/hinos.json";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        Selecao selecao = escolherDoDia(context);
        for (int appWidgetId : appWidgetIds) {
            atualizarWidget(context, appWidgetManager, appWidgetId, selecao);
        }
    }

    public static void atualizarTodos(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName componente = new ComponentName(context, HinoDiaWidget.class);
        int[] ids = manager.getAppWidgetIds(componente);
        if (ids == null || ids.length == 0) return;
        Selecao selecao = escolherDoDia(context);
        for (int id : ids) {
            atualizarWidget(context, manager, id, selecao);
        }
    }

    private static void atualizarWidget(
            Context context,
            AppWidgetManager appWidgetManager,
            int appWidgetId,
            Selecao selecao) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_hino_dia);
        if (selecao == null) {
            views.setTextViewText(R.id.widget_estrofe, "Toque para abrir o app");
            views.setTextViewText(R.id.widget_titulo, "Harpa Cristã");
        } else {
            views.setTextViewText(R.id.widget_estrofe, selecao.estrofe);
            views.setTextViewText(
                    R.id.widget_titulo,
                    "Hino " + selecao.numero + " — " + selecao.titulo);
        }

        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction(Intent.ACTION_VIEW);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        if (selecao != null) {
            intent.setData(Uri.parse("org.harpacrista.app://hino/" + selecao.numero));
        }
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pending = PendingIntent.getActivity(context, appWidgetId, intent, flags);
        views.setOnClickPendingIntent(R.id.widget_root, pending);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static Selecao escolherDoDia(Context context) {
        try {
            JSONArray hinos = lerHinos(context);
            if (hinos == null || hinos.length() == 0) return null;

            List<JSONObject> candidatos = new ArrayList<>();
            for (int i = 0; i < hinos.length(); i++) {
                JSONObject h = hinos.optJSONObject(i);
                if (h == null) continue;
                int id = h.optInt("id", -1);
                if (id >= 1 && id <= ID_MAXIMO_NACIONAL) {
                    candidatos.add(h);
                }
            }
            if (candidatos.isEmpty()) return null;

            Calendar cal = Calendar.getInstance();
            int ano = cal.get(Calendar.YEAR);
            int dia = cal.get(Calendar.DAY_OF_YEAR);
            long seed = (long) ano * 1000L + dia;
            Random rnd = new Random(seed);

            JSONObject hino = candidatos.get(rnd.nextInt(candidatos.size()));
            int numero = hino.optInt("id");
            String titulo = hino.optString("titulo", "");
            String conteudo = hino.optString("conteudo", "");

            List<String> estrofes = extrairEstrofes(conteudo);
            if (estrofes.isEmpty()) return null;
            String estrofe = estrofes.get(rnd.nextInt(estrofes.size()));

            return new Selecao(numero, titulo, estrofe);
        } catch (Exception e) {
            return null;
        }
    }

    private static JSONArray lerHinos(Context context) {
        try {
            StringBuilder sb = new StringBuilder();
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(
                            context.getAssets().open(CAMINHO_JSON),
                            StandardCharsets.UTF_8))) {
                char[] buf = new char[8192];
                int n;
                while ((n = br.read(buf)) > 0) sb.append(buf, 0, n);
            }
            return new JSONArray(sb.toString());
        } catch (IOException e) {
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private static List<String> extrairEstrofes(String htmlBruto) {
        List<String> resultado = new ArrayList<>();
        if (htmlBruto == null || htmlBruto.isEmpty()) return resultado;

        int idxAutor = -1;
        String alvo = "Autor ou Tradutor";
        int p = htmlBruto.indexOf(alvo);
        if (p >= 0) idxAutor = p;
        String base = idxAutor >= 0 ? htmlBruto.substring(0, idxAutor) : htmlBruto;

        String[] partes = base.split("(?:<br\\s*/?>\\s*){2,}");
        for (String parte : partes) {
            String texto = limparHtml(parte);
            texto = removerNumeroInicial(texto);
            if (texto.length() >= 20) {
                resultado.add(texto);
            }
        }
        return resultado;
    }

    private static String limparHtml(String html) {
        String comQuebras = html.replaceAll("(?i)<br\\s*/?>", "\n");
        CharSequence semTags = Html.fromHtml(comQuebras, Html.FROM_HTML_MODE_LEGACY);
        String texto = semTags.toString();
        texto = texto.replaceAll("[ \\t]+\\n", "\n");
        texto = texto.replaceAll("\\n{3,}", "\n\n");
        return texto.trim();
    }

    private static String removerNumeroInicial(String texto) {
        return texto.replaceFirst("^\\d{1,2}\\s*\\n", "").trim();
    }

    private static class Selecao {
        final int numero;
        final String titulo;
        final String estrofe;

        Selecao(int numero, String titulo, String estrofe) {
            this.numero = numero;
            this.titulo = titulo;
            this.estrofe = estrofe;
        }
    }
}
