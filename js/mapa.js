let mapa;

let camadaAcidentes;

let acidentes = [];


// =====================================================
// INICIALIZAR MAPA
// =====================================================

mapa = L.map("mapa").setView(
    [-14.2350, -51.9253],
    4
);


// =====================================================
// MAPA BASE
// =====================================================

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            '&copy; OpenStreetMap contributors'
    }
).addTo(mapa);


// =====================================================
// CARREGAR GEOJSON
// =====================================================

fetch("dados/acidentes.geojson")

    .then(response => {

        if (!response.ok) {

            throw new Error(
                "Erro ao carregar acidentes.geojson"
            );

        }

        return response.json();

    })

    .then(data => {

        acidentes = data.features;

        console.log(
            "Acidentes carregados:",
            acidentes.length
        );

        carregarFiltros();

        mostrarAcidentes(acidentes);

        atualizarContador(
            acidentes.length
        );

    })

    .catch(error => {

        console.error(error);

        alert(
            "Não foi possível carregar os dados dos acidentes."
        );

    });


// =====================================================
// COR DO ACIDENTE
// =====================================================

function obterCor(gravidade) {

    switch (gravidade) {

        case "Fatal":
            return "#C53030";

        case "Grave":
            return "#DD6B20";

        case "Leve":
            return "#D69E2E";

        case "Sem vítimas":
            return "#718096";

        default:
            return "#718096";

    }

}


// =====================================================
// MOSTRAR ACIDENTES
// =====================================================

function mostrarAcidentes(lista) {

    // Remove o cluster anterior
    if (camadaAcidentes) {

        mapa.removeLayer(
            camadaAcidentes
        );

    }


    // Cria um novo grupo de clusters
    camadaAcidentes =
        L.markerClusterGroup({

            // Distância máxima entre pontos
            // para serem agrupados
            maxClusterRadius: 50,

            // Animação ao aproximar/afastar
            animate: true,

            // Animação ao criar os clusters
            animateAddingMarkers: true,

            // Mostra a área dos pontos
            // quando o mouse passa sobre o cluster
            showCoverageOnHover: true,

            // Faz o mapa dar zoom quando
            // o usuário clica no cluster
            zoomToBoundsOnClick: true

        });


    // Percorre os acidentes
    lista.forEach(feature => {

        const p =
            feature.properties;


        // Coordenadas
        const latitude =
            feature.geometry.coordinates[1];

        const longitude =
            feature.geometry.coordinates[0];


        // Cria o marcador individual
        const marcador =
            L.circleMarker(

                [
                    latitude,
                    longitude
                ],

                {

                    radius: 5,

                    fillColor:
                        obterCor(
                            p.gravidade
                        ),

                    color: "#FFFFFF",

                    weight: 1,

                    opacity: 1,

                    fillOpacity: 0.75

                }

            );


        // =====================================
        // POPUP
        // =====================================

        const popup = `

            <div style="min-width: 220px">

                <h3>
                    Acidente ${p.id}
                </h3>

                <hr>

                <strong>Data:</strong>
                ${p.data}

                <br>

                <strong>Horário:</strong>
                ${p.horario}

                <br><br>

                <strong>Local:</strong><br>

                BR-${p.br},
                KM ${p.km}

                <br>

                ${p.municipio}
                - ${p.uf}

                <br><br>

                <strong>Tipo:</strong>
                ${p.tipo}

                <br>

                <strong>Gravidade:</strong>
                ${p.gravidade}

                <hr>

                <strong>Mortos:</strong>
                ${p.mortos}

                <br>

                <strong>
                    Feridos graves:
                </strong>

                ${p.feridos_graves}

                <br>

                <strong>
                    Feridos leves:
                </strong>

                ${p.feridos_leves}

                <br>

                <strong>
                    Pessoas ilesas:
                </strong>

                ${p.ilesos}

                <hr>

                <strong>
                    Veículos envolvidos:
                </strong>

                ${p.quantidade_veiculos}

            </div>

        `;


        marcador.bindPopup(
            popup
        );


        // Adiciona o marcador
        // ao grupo de clusters
        camadaAcidentes.addLayer(
            marcador
        );

    });


    // Adiciona o cluster ao mapa
    mapa.addLayer(
        camadaAcidentes
    );

}


// =====================================================
// FILTROS
// =====================================================

function carregarFiltros() {

    const filtroUF =
        document.getElementById(
            "filtroUF"
        );

    const filtroBR =
        document.getElementById(
            "filtroBR"
        );


    const ufs = [

        ...new Set(

            acidentes.map(
                feature =>
                    feature.properties.uf
            )

        )

    ].sort();


    const brs = [

        ...new Set(

            acidentes.map(
                feature =>
                    feature.properties.br
            )

        )

    ].sort(
        (a, b) => a - b
    );


    ufs.forEach(uf => {

        const option =
            document.createElement(
                "option"
            );

        option.value = uf;

        option.textContent = uf;

        filtroUF.appendChild(
            option
        );

    });


    brs.forEach(br => {

        const option =
            document.createElement(
                "option"
            );

        option.value = br;

        option.textContent =
            `BR-${br}`;

        filtroBR.appendChild(
            option
        );

    });

}


// =====================================================
// APLICAR FILTROS
// =====================================================

function aplicarFiltros() {

    const uf =
        document.getElementById(
            "filtroUF"
        ).value;


    const br =
        document.getElementById(
            "filtroBR"
        ).value;


    const gravidade =
        document.getElementById(
            "filtroGravidade"
        ).value;


    const filtrados =
        acidentes.filter(
            feature => {

                const p =
                    feature.properties;


                const correspondeUF =
                    uf === "todos" ||
                    p.uf === uf;


                const correspondeBR =
                    br === "todos" ||
                    String(p.br) === br;


                const correspondeGravidade =
                    gravidade === "todos" ||
                    p.gravidade === gravidade;


                return (
                    correspondeUF &&
                    correspondeBR &&
                    correspondeGravidade
                );

            }
        );


    mostrarAcidentes(
        filtrados
    );


    atualizarContador(
        filtrados.length
    );

}


// =====================================================
// EVENTOS DOS FILTROS
// =====================================================

document
    .getElementById("filtroUF")
    .addEventListener(
        "change",
        aplicarFiltros
    );


document
    .getElementById("filtroBR")
    .addEventListener(
        "change",
        aplicarFiltros
    );


document
    .getElementById("filtroGravidade")
    .addEventListener(
        "change",
        aplicarFiltros
    );


// =====================================================
// LIMPAR FILTROS
// =====================================================

document
    .getElementById("btnLimpar")
    .addEventListener(
        "click",
        function() {

            document
                .getElementById(
                    "filtroUF"
                )
                .value = "todos";


            document
                .getElementById(
                    "filtroBR"
                )
                .value = "todos";


            document
                .getElementById(
                    "filtroGravidade"
                )
                .value = "todos";


            mostrarAcidentes(
                acidentes
            );


            atualizarContador(
                acidentes.length
            );

        }
    );


// =====================================================
// CONTADOR
// =====================================================

function atualizarContador(
    quantidade
) {

    document
        .getElementById(
            "totalAcidentes"
        )
        .textContent =
        quantidade.toLocaleString(
            "pt-BR"
        );

}