using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class GamePiece : MonoBehaviour
{
    public Material inactiveMaterial;
    public Material activeMaterial;
    public bool active = false;

    private float nextChangeTime;
    private GameObject lostText;

    private void Awake()
    {
        // Kauhee rivi mutta kelvannee nyt purkkaviritelm‰n‰ t‰h‰n
        lostText = GameObject.Find("Canvas").transform.Find("LostText").gameObject;
    }

    private void Start()
    {
        // Asetetaan ensimm‰inen aika Cuben aktivoitumiselle
        nextChangeTime = Time.time + Random.Range(3f, 7f);
    }

    private void Update()
    {
        // Muutetaan tilaa aina kun nextChangeTime ylitet‰‰n
        if (nextChangeTime <= Time.time)
        {
            // Jos Cube oli liian pitk‰‰n aktiivinen ilman pelaajan klikkausta, niin peli h‰vit‰‰n
            if (active)
            {
                SetActivity(false);
                lostText.SetActive(true);
                Time.timeScale = 0; //Pys‰ytet‰‰n peli
            }
            // Jos Cube on ollut inaktiivisena tarpeeksi pitk‰‰n, asetetaan takaisin aktiiviseksi
            else SetActivity(true);
        }
    }

    // Muuttaa Cuben aktiivisuus-tilan ja arpoo uuden ajan, kun sit‰ taas muutetaan
    public void SetActivity(bool state)
    {
        active = state;
        gameObject.GetComponent<MeshRenderer>().material = active ? activeMaterial : inactiveMaterial;
        nextChangeTime = Time.time + Random.Range(0.6f, 2f);
    }
}
