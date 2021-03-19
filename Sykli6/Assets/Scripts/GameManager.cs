using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

// Huolehtii pelitilan muutoksista pelaajan inputin kautta
public class GameManager : MonoBehaviour
{
    public Text scoreText;
    public int score = 0;

    void Start()
    {
        scoreText = GameObject.Find("ScoreText").GetComponent<Text>();
    }

    void Update()
    {
        // Tarkistetaan täppäsikö pelaaja peliobjektien kohdalta
        if (Input.touchCount > 0)
        {
            foreach (var touch in Input.touches)
            {
                RaycastHit hit;
                Ray ray = Camera.current.ScreenPointToRay(touch.position);
                if (Physics.Raycast(ray, out hit))
                {
                    // Jos osui Cubeen joka oli active niin annetaan pelaajalle pisteitä ja aseteaan Cube inactiveksi
                    if (hit.collider.CompareTag("Cube") && hit.collider.GetComponent<GamePiece>().active)
                    {
                        hit.collider.GetComponent<GamePiece>().SetActivity(false);
                        score++;
                        scoreText.text = "Score: " + score;
                    }
                }
            }
        }
    }
}
